import { create } from 'zustand';
import type { CallTask, CallTaskStatus, Priority, DrugCategory } from '@/types';
import { patients } from '@/data/patients';
import dayjs from 'dayjs';
import { useRulesStore } from './rulesStore';
import { useDashboardStore } from './dashboardStore';

const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'high', 'medium', 'medium', 'low'];
const statuses: Array<'pending' | 'calling' | 'completed' | 'failed'> = [
  'pending', 'pending', 'pending', 'pending', 'pending',
  'calling', 'completed', 'completed', 'failed',
];

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

function buildInitialTasks(): CallTask[] {
  const rules = useRulesStore.getState().rules.filter(r => r.enabled);
  const today = dayjs().format('YYYY-MM-DD');
  const tasks: CallTask[] = [];
  let counter = 1;

  patients.forEach((patient) => {
    const matchedRules = rules.filter(r =>
      r.drugCategories.some(c => patient.lastDrugCategory === c)
    );
    const rulesToApply = matchedRules.length > 0 ? matchedRules : (rules.length > 0 ? [rules[0]] : []);
    rulesToApply.forEach(rule => {
      const priority = rule.priority;
      const status = statuses[(counter - 1) % statuses.length];
      tasks.push({
        id: `task-${counter.toString().padStart(3, '0')}`,
        patientId: patient.id,
        ruleId: rule.id,
        storeId: patient.storeId,
        pharmacistId: patient.pharmacistId,
        scheduledDate: today,
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
    set((state) => ({ callTasks: [...state.callTasks, newTask] }));
    setTimeout(() => useDashboardStore.getState().refreshStats(), 0);
  },

  updateTaskStatus: (id, status) => {
    set((state) => ({
      callTasks: state.callTasks.map((t) =>
        t.id === id ? { ...t, status } : t
      ),
    }));
    setTimeout(() => useDashboardStore.getState().refreshStats(), 0);
  },

  incrementCallCount: (id) => {
    set((state) => ({
      callTasks: state.callTasks.map((t) =>
        t.id === id ? { ...t, callCount: t.callCount + 1 } : t
      ),
    }));
  },

  getTaskById: (id) => {
    return get().callTasks.find((t) => t.id === id);
  },

  getTasksByStore: (storeId) => {
    return get().callTasks.filter((t) => t.storeId === storeId);
  },

  getTasksByStatus: (status) => {
    return get().callTasks.filter((t) => t.status === status);
  },

  getTasksByPriority: (priority) => {
    return get().callTasks.filter((t) => t.priority === priority);
  },

  getTasksByDrugCategory: (category) => {
    return get().callTasks.filter((t) => t.lastDrugCategory === category);
  },

  getTasksByScheduledDate: (date) => {
    return get().callTasks.filter((t) => t.scheduledDate === date);
  },

  getPendingTasksSorted: () => {
    return get()
      .callTasks.filter((t) => t.status === 'pending' || t.status === 'calling')
      .sort((a, b) => {
        if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        }
        return a.callCount - b.callCount;
      });
  },

  regenerateTasksFromRules: () => {
    const existingCompleted = new Map(
      get()
        .callTasks.filter((t) => t.status === 'completed' || t.status === 'failed')
        .map((t) => [`${t.patientId}-${t.ruleId}`, t])
    );

    const rules = useRulesStore.getState().rules.filter((r) => r.enabled);
    const today = dayjs().format('YYYY-MM-DD');
    const tasks: CallTask[] = [];
    let counter = 1;

    patients.forEach((patient) => {
      const matchedRules = rules.filter((r) =>
        r.drugCategories.some((c) => patient.lastDrugCategory === c)
      );
      const rulesToApply = matchedRules.length > 0 ? matchedRules : (rules.length > 0 ? [rules[0]] : []);

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
            scheduledDate: today,
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
    setTimeout(() => useDashboardStore.getState().refreshStats(), 0);
  },
}));
