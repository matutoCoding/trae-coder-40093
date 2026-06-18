import { create } from 'zustand';
import type { PharmacistTask, PharmacistTaskStatus, PharmacistTaskPriority } from '@/types';
import { pharmacistTasks as initialTasks } from '@/data/pharmacistTasks';

interface PharmacistTasksState {
  pharmacistTasks: PharmacistTask[];
  addPharmacistTask: (task: Omit<PharmacistTask, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (id: string, status: PharmacistTaskStatus) => void;
  updateTaskPriority: (id: string, priority: PharmacistTaskPriority) => void;
  addNote: (id: string, note: string, handleResult?: string) => void;
  getTaskById: (id: string) => PharmacistTask | undefined;
  getTasksByPharmacist: (pharmacistId: string) => PharmacistTask[];
  getTasksByStore: (storeId: string) => PharmacistTask[];
  getTasksByStatus: (status: PharmacistTaskStatus) => PharmacistTask[];
  getPendingTasksCount: (pharmacistId?: string) => number;
}

export const usePharmacistTaskStore = create<PharmacistTasksState>((set, get) => ({
  pharmacistTasks: initialTasks,

  addPharmacistTask: (taskData) => {
    const newTask: PharmacistTask = {
      ...taskData,
      id: `phtask-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ pharmacistTasks: [...state.pharmacistTasks, newTask] }));
  },

  updateTaskStatus: (id, status) => {
    set((state) => ({
      pharmacistTasks: state.pharmacistTasks.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            status,
            handledAt: status === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      }),
    }));
  },

  updateTaskPriority: (id, priority) => {
    set((state) => ({
      pharmacistTasks: state.pharmacistTasks.map((t) =>
        t.id === id ? { ...t, priority } : t
      ),
    }));
  },

  addNote: (id, note, handleResult) => {
    set((state) => ({
      pharmacistTasks: state.pharmacistTasks.map((t) =>
        t.id === id ? { ...t, note, handleResult } : t
      ),
    }));
  },

  getTaskById: (id) => {
    return get().pharmacistTasks.find((t) => t.id === id);
  },

  getTasksByPharmacist: (pharmacistId) => {
    return get()
      .pharmacistTasks.filter((t) => t.pharmacistId === pharmacistId)
      .sort((a, b) => {
        const statusOrder: Record<PharmacistTaskStatus, number> = { pending: 0, processing: 1, completed: 2 };
        const priorityOrder: Record<PharmacistTaskPriority, number> = { urgent: 0, normal: 1, low: 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  },

  getTasksByStore: (storeId) => {
    return get().pharmacistTasks.filter((t) => t.storeId === storeId);
  },

  getTasksByStatus: (status) => {
    return get().pharmacistTasks.filter((t) => t.status === status);
  },

  getPendingTasksCount: (pharmacistId) => {
    return get().pharmacistTasks.filter(
      (t) => t.status !== 'completed' && (!pharmacistId || t.pharmacistId === pharmacistId)
    ).length;
  },
}));
