import { create } from 'zustand';
import type { CallTask, CallTaskStatus, Priority, DrugCategory } from '@/types';
import { callTasks as initialCallTasks } from '@/data/callTasks';

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
}

export const useCallTaskStore = create<CallTaskState>((set, get) => ({
  callTasks: initialCallTasks,

  addCallTask: (taskData) => {
    const newTask: CallTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    set((state) => ({ callTasks: [...state.callTasks, newTask] }));
  },

  updateTaskStatus: (id, status) => {
    set((state) => ({
      callTasks: state.callTasks.map((t) =>
        t.id === id ? { ...t, status } : t
      ),
    }));
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
    const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    return get()
      .callTasks.filter((t) => t.status === 'pending' || t.status === 'calling')
      .sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.callCount - b.callCount;
      });
  },
}));
