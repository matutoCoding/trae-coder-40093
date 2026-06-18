import { create } from 'zustand';
import type { Rule, DrugCategory, TriggerType, Priority } from '@/types';
import { rules as initialRules } from '@/data/rules';
import { useCallTaskStore } from './callTaskStore';
import { useDashboardStore } from './dashboardStore';

function notifyChanges() {
  setTimeout(() => {
    useCallTaskStore.getState().regenerateTasksFromRules();
    useDashboardStore.getState().refreshStats();
  }, 0);
}

interface RulesState {
  rules: Rule[];
  addRule: (rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRule: (id: string, updates: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  getRuleById: (id: string) => Rule | undefined;
}

export const useRulesStore = create<RulesState>((set, get) => ({
  rules: initialRules,

  addRule: (ruleData) => {
    const now = new Date().toISOString();
    const newRule: Rule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ rules: [newRule, ...state.rules] }));
    notifyChanges();
  },

  updateRule: (id, updates) => {
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    }));
    notifyChanges();
  },

  deleteRule: (id) => {
    set((state) => ({
      rules: state.rules.filter((r) => r.id !== id),
    }));
    notifyChanges();
  },

  toggleRule: (id) => {
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === id
          ? { ...r, enabled: !r.enabled, updatedAt: new Date().toISOString() }
          : r
      ),
    }));
    notifyChanges();
  },

  getRuleById: (id) => {
    return get().rules.find((r) => r.id === id);
  },
}));

export { DrugCategory, TriggerType, Priority };
