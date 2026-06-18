import { create } from 'zustand';
import type { CallTask, CallTaskStatus, Priority, DrugCategory } from '@/types';
import { patients } from '@/data/patients';
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

const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'high', 'medium', 'medium', 'low'];
const statuses: Array<'pending' | 'calling' | 'completed' | 'failed'> = [
  'pending', 'pending', 'pending', 'pending', 'pending',
  'calling', 'completed', 'completed', 'failed',
];

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

export function computeMatchedTasks(): CallTask[] {
  const rules = safeGetEnabledRules();
  const today = dayjs();
  const tasks: CallTask[] = [];
  let counter = 1;

  patients.forEach((patient) => {
    const diffDays = today.diff(dayjs(patient.lastPurchaseDate), 'day');
    const isNewCustomer = patient.tags.includes('新客');

    // 根据患者药品类别和触发天数精准匹配规则
    const matchedRules = rules.filter((r) => {
      // 1. 药品类别必须匹配
      if (!r.drugCategories.some((c) => patient.lastDrugCategory === c)) return false;
      // 2. 按触发类型和触发天数做窗口匹配
      switch (r.triggerType) {
        case 'days_after_purchase':
          // 购药后第N天：允许N±2天的容差窗口
          return diffDays >= Math.max(0, r.triggerValue - 2) && diffDays <= r.triggerValue + 2;
        case 'day_after_arrival':
          // 冷链到货次日：触发天数附近±1天(0~触发值+1天内)
          return diffDays >= 0 && diffDays <= r.triggerValue + 1;
        case 'days_after_first_purchase':
          // 新客首服：需带「新客」标签 + 1~触发值+2天窗口
          if (!isNewCustomer) return false;
          return diffDays >= 1 && diffDays <= r.triggerValue + 2;
        default:
          return false;
      }
    });

    const rulesToApply = matchedRules;

    rulesToApply.forEach((rule) => {
      const priority = rule.priority;
      const status = statuses[(counter - 1) % statuses.length];
      tasks.push({
        id: `task-${counter.toString().padStart(3, '0')}`,
        patientId: patient.id,
        ruleId: rule.id,
        storeId: patient.storeId,
        pharmacistId: patient.pharmacistId,
        scheduledDate: today.format('YYYY-MM-DD'),
        priority,
        status,
        keyPoints: rule.keyPoints,
        lastDrugName: patient.lastDrugName,
        lastDrugCategory: patient.lastDrugCategory,
        lastPurchaseDate: patient.lastPurchaseDate,
        callCount: status === 'pending' ? 0 : Math.floor(Math.random() * 2) + 1,
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
    const next = get().callTasks.map((t) =>
      t.id === id ? { ...t, status } : t
    );
    set({ callTasks: next });
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
        const isNewCustomer = patient.tags.includes('新客');

        const matchedRules = rules.filter((r) => {
          if (!r.drugCategories.some((c) => patient.lastDrugCategory === c)) return false;
          switch (r.triggerType) {
            case 'days_after_purchase':
              return diffDays >= Math.max(0, r.triggerValue - 2) && diffDays <= r.triggerValue + 2;
            case 'day_after_arrival':
              return diffDays >= 0 && diffDays <= r.triggerValue + 1;
            case 'days_after_first_purchase':
              if (!isNewCustomer) return false;
              return diffDays >= 1 && diffDays <= r.triggerValue + 2;
            default:
              return false;
          }
        });
        const rulesToApply = matchedRules;

        rulesToApply.forEach((rule) => {
          const cacheKey = `${patient.id}-${rule.id}`;
          const existing = existingCompleted.get(cacheKey);
          if (existing) {
            tasks.push({
              ...existing,
              keyPoints: rule.keyPoints,
            });
          } else {
            const priority = rule.priority;
            tasks.push({
              id: `task-${counter.toString().padStart(3, '0')}`,
              patientId: patient.id,
              ruleId: rule.id,
              storeId: patient.storeId,
              pharmacistId: patient.pharmacistId,
              scheduledDate: todayStr,
              priority,
              status: 'pending',
              keyPoints: rule.keyPoints,
              lastDrugName: patient.lastDrugName,
              lastDrugCategory: patient.lastDrugCategory,
              lastPurchaseDate: patient.lastPurchaseDate,
              callCount: 0,
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
