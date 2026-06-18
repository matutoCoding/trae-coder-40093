import { create } from 'zustand';
import type { CallTask, CallTaskStatus, Priority, DrugCategory, MatchReason, TriggerTolerance } from '@/types';
import { patients } from '@/data/patients';
import { stores } from '@/data/stores';
import dayjs from 'dayjs';
import { useRulesStore } from './rulesStore';

const SESSION_COUNTED_KEY = 'dtp.call-counted.v1';

function getSessionCounted(): Set<string> {
  try {
    const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem(SESSION_COUNTED_KEY) : null;
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch (e) {
    return new Set();
  }
}

function setSessionCounted(set: Set<string>) {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(SESSION_COUNTED_KEY, JSON.stringify(Array.from(set)));
    }
  } catch (e) { /* ignore */ }
}

export function isTaskCounted(taskId: string): boolean {
  return getSessionCounted().has(taskId);
}

export function markTaskCounted(taskId: string): void {
  const set = getSessionCounted();
  if (!set.has(taskId)) {
    set.add(taskId);
    setSessionCounted(set);
  }
}

export function clearTaskCounted(taskId: string): void {
  const set = getSessionCounted();
  if (set.has(taskId)) {
    set.delete(taskId);
    setSessionCounted(set);
  }
}

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

type TaskChangeListener = (tasks: CallTask[]) => void;
const taskListeners = new Set<TaskChangeListener>();

function emitTaskChange(tasks: CallTask[]) {
  taskListeners.forEach((fn) => {
    try { fn(tasks); } catch (e) { console.warn('[taskStore listener error]', e); }
  });
}

export function subscribeTasksChanges(fn: TaskChangeListener) {
  taskListeners.add(fn);
  return () => taskListeners.delete(fn);
}

function safeGetEnabledRules() {
  try {
    const s = useRulesStore.getState?.();
    if (!s || !s.rules) return [];
    return s.rules.filter((r) => r.enabled);
  } catch (e) {
    console.warn('[safeGetEnabledRules] fallback empty', e);
    return [];
  }
}

export function matchRule(rule: {
  drugCategories: DrugCategory[];
  triggerType: string;
  triggerValue: number;
  triggerTolerance: TriggerTolerance;
}, patient: {
  lastDrugCategory: DrugCategory;
  lastPurchaseDate: string;
  tags: string[];
}, diffDays: number): boolean {
  if (!rule.drugCategories.some((c) => patient.lastDrugCategory === c)) return false;
  const tol = rule.triggerTolerance;
  switch (rule.triggerType) {
    case 'days_after_purchase':
      return diffDays >= Math.max(0, rule.triggerValue - tol) && diffDays <= rule.triggerValue + tol;
    case 'day_after_arrival':
      return diffDays >= 0 && diffDays <= rule.triggerValue + tol;
    case 'days_after_first_purchase':
      if (!patient.tags.includes('新客')) return false;
      return diffDays >= 1 && diffDays <= rule.triggerValue + tol;
    default:
      return false;
  }
}

export interface SimulateResult {
  totalPatients: number;
  totalTasks: number;
  storeBreakdown: { storeId: string; storeName: string; count: number }[];
  patients: { id: string; name: string; storeId: string; drugCategory: DrugCategory; lastPurchaseDate: string; daysDiff: number }[];
}

export function simulateRule(rule: {
  drugCategories: DrugCategory[];
  triggerType: string;
  triggerValue: number;
  triggerTolerance: TriggerTolerance;
}): SimulateResult {
  const today = dayjs();
  const matched: SimulateResult['patients'] = [];
  const storeMap: Record<string, number> = {};

  patients.forEach((p) => {
    const diff = today.diff(dayjs(p.lastPurchaseDate), 'day');
    if (matchRule(rule, p, diff)) {
      matched.push({
        id: p.id, name: p.name, storeId: p.storeId,
        drugCategory: p.lastDrugCategory,
        lastPurchaseDate: p.lastPurchaseDate, daysDiff: diff,
      });
      storeMap[p.storeId] = (storeMap[p.storeId] || 0) + 1;
    }
  });

  return {
    totalPatients: matched.length,
    totalTasks: matched.length,
    storeBreakdown: Object.entries(storeMap).map(([storeId, count]) => {
      const s = stores.find((x) => x.id === storeId);
      return { storeId, storeName: s?.name || storeId, count };
    }),
    patients: matched,
  };
}

export function computeMatchedTasks(): CallTask[] {
  const rules = safeGetEnabledRules();
  const today = dayjs();
  const tasks: CallTask[] = [];
  let counter = 1;

  patients.forEach((patient) => {
    const diffDays = today.diff(dayjs(patient.lastPurchaseDate), 'day');

    const matchedRules = rules.filter((r) => matchRule(r, patient, diffDays));

    matchedRules.forEach((rule) => {
      const matchReason: MatchReason = {
        ruleId: rule.id,
        ruleName: rule.name,
        triggerType: rule.triggerType,
        triggerValue: rule.triggerValue,
        triggerTolerance: rule.triggerTolerance,
        drugCategory: patient.lastDrugCategory,
        patientLastPurchaseDate: patient.lastPurchaseDate,
        daysDiff: diffDays,
      };
      tasks.push({
        id: `task-${counter.toString().padStart(3, '0')}`,
        patientId: patient.id,
        ruleId: rule.id,
        storeId: patient.storeId,
        pharmacistId: patient.pharmacistId,
        scheduledDate: today.format('YYYY-MM-DD'),
        priority: rule.priority,
        status: 'pending',
        keyPoints: rule.keyPoints,
        lastDrugName: patient.lastDrugName,
        lastDrugCategory: patient.lastDrugCategory,
        lastPurchaseDate: patient.lastPurchaseDate,
        callCount: 0,
        matchReason,
      });
      counter++;
    });
  });

  return tasks;
}

function buildInitialTasks(): CallTask[] {
  try {
    return computeMatchedTasks();
  } catch (e) {
    console.error('[buildInitialTasks] failed, fallback empty', e);
    return [];
  }
}

interface CallTaskState {
  callTasks: CallTask[];
  addCallTask: (task: Omit<CallTask, 'id'>) => void;
  updateTaskStatus: (id: string, status: CallTaskStatus) => void;
  incrementCallCount: (id: string) => void;
  getTaskById: (id: string) => CallTask | undefined;
  getTasksByStore: (storeId: string) => CallTask[];
  getTasksByStatus: (status: CallTaskStatus) => CallTask[];
  getTasksByPriority: (priority: Priority) => CallTask[];
  getTasksByDrugCategory: (category: DrugCategory) => CallTask[];
  getTasksByScheduledDate: (date: string) => CallTask[];
  getPendingTasksSorted: () => CallTask[];
  regenerateTasksFromRules: () => void;
}

export const useCallTaskStore = create<CallTaskState>((set, get) => ({
  callTasks: buildInitialTasks(),

  addCallTask: (taskData) => {
    const newTask: CallTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    const next = [...get().callTasks, newTask];
    set({ callTasks: next });
    emitTaskChange(next);
  },

  updateTaskStatus: (id, status) => {
    const prev = get().callTasks.find((t) => t.id === id);
    const next = get().callTasks.map((t) =>
      t.id === id ? { ...t, status } : t
    );
    set({ callTasks: next });
    if (status === 'pending' && prev?.status !== 'pending') {
      clearTaskCounted(id);
    }
    emitTaskChange(next);
  },

  incrementCallCount: (id) => {
    if (isTaskCounted(id)) return;
    markTaskCounted(id);
    const next = get().callTasks.map((t) =>
      t.id === id ? { ...t, callCount: t.callCount + 1 } : t
    );
    set({ callTasks: next });
  },

  getTaskById: (id) => get().callTasks.find((t) => t.id === id),

  getTasksByStore: (storeId) => get().callTasks.filter((t) => t.storeId === storeId),

  getTasksByStatus: (status) => get().callTasks.filter((t) => t.status === status),

  getTasksByPriority: (priority) => get().callTasks.filter((t) => t.priority === priority),

  getTasksByDrugCategory: (category) => get().callTasks.filter((t) => t.lastDrugCategory === category),

  getTasksByScheduledDate: (date) => get().callTasks.filter((t) => t.scheduledDate === date),

  getPendingTasksSorted: () =>
    get()
      .callTasks.filter((t) => t.status === 'pending' || t.status === 'calling')
      .sort((a, b) => {
        if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        }
        return a.callCount - b.callCount;
      }),

  regenerateTasksFromRules: () => {
    try {
      const existingCompleted = new Map(
        get()
          .callTasks.filter((t) => t.status === 'completed' || t.status === 'failed')
          .map((t) => [`${t.patientId}-${t.ruleId}`, t])
      );

      const rules = safeGetEnabledRules();
      const today = dayjs();
      const todayStr = today.format('YYYY-MM-DD');
      const tasks: CallTask[] = [];
      let counter = 1;

      patients.forEach((patient) => {
        const diffDays = today.diff(dayjs(patient.lastPurchaseDate), 'day');

        const matchedRules = rules.filter((r) => matchRule(r, patient, diffDays));

        matchedRules.forEach((rule) => {
          const cacheKey = `${patient.id}-${rule.id}`;
          const existing = existingCompleted.get(cacheKey);
          const matchReason: MatchReason = {
            ruleId: rule.id,
            ruleName: rule.name,
            triggerType: rule.triggerType,
            triggerValue: rule.triggerValue,
            triggerTolerance: rule.triggerTolerance,
            drugCategory: patient.lastDrugCategory,
            patientLastPurchaseDate: patient.lastPurchaseDate,
            daysDiff: diffDays,
          };
          if (existing) {
            tasks.push({
              ...existing,
              keyPoints: rule.keyPoints,
              matchReason,
            });
          } else {
            tasks.push({
              id: `task-${counter.toString().padStart(3, '0')}`,
              patientId: patient.id,
              ruleId: rule.id,
              storeId: patient.storeId,
              pharmacistId: patient.pharmacistId,
              scheduledDate: todayStr,
              priority: rule.priority,
              status: 'pending',
              keyPoints: rule.keyPoints,
              lastDrugName: patient.lastDrugName,
              lastDrugCategory: patient.lastDrugCategory,
              lastPurchaseDate: patient.lastPurchaseDate,
              callCount: 0,
              matchReason,
            });
          }
          counter++;
        });
      });

      set({ callTasks: tasks });
      emitTaskChange(tasks);
    } catch (e) {
      console.error('[regenerateTasksFromRules] failed', e);
    }
  },
}));
