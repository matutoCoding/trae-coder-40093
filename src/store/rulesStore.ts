import { create } from 'zustand';
import type { Rule, DrugCategory, TriggerType, Priority } from '@/types';
import { rules as initialRules } from '@/data/rules';

type RulesChangedCallback = (rules: Rule[]) => void;
const listeners = new Set<RulesChangedCallback>();

function emitChange(rules: Rule[]) {
  listeners.forEach((fn) => {
    try { fn(rules); } catch (e) { console.warn('[rulesStore listener error]', e); }
  });
}

export function subscribeRulesChanges(fn: RulesChangedCallback) {
  listeners.add(fn);
  return () => listeners.delete(fn);
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
    const next = [newRule, ...get().rules];
    set({ rules: next });
    emitChange(next);
  },

  updateRule: (id, updates) => {
    const next = get().rules.map((r) =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    );
    set({ rules: next });
    emitChange(next);
  },

  deleteRule: (id) => {
    const next = get().rules.filter((r) => r.id !== id);
    set({ rules: next });
    emitChange(next);
  },

  toggleRule: (id) => {
    const next = get().rules.map((r) =>
      r.id === id
        ? { ...r, enabled: !r.enabled, updatedAt: new Date().toISOString() }
        : r
    );
    set({ rules: next });
    emitChange(next);
  },

  getRuleById: (id) => get().rules.find((r) => r.id === id),
}));

export { DrugCategory, TriggerType, Priority };
