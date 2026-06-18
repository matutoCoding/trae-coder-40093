import type { CallTask, MatchReason } from '@/types';
import { patients } from './patients';
import { rules } from './rules';
import dayjs from 'dayjs';

export function generateCallTasks(): CallTask[] {
  const tasks: CallTask[] = [];
  const today = dayjs();
  const enabledRules = rules.filter(r => r.enabled);

  patients.forEach((patient, idx) => {
    const diffDays = today.diff(dayjs(patient.lastPurchaseDate), 'day');
    enabledRules.forEach((rule) => {
      if (!rule.drugCategories.some((c) => patient.lastDrugCategory === c)) return;
      const tol = rule.triggerTolerance;
      let matched = false;
      switch (rule.triggerType) {
        case 'days_after_purchase':
          matched = diffDays >= Math.max(0, rule.triggerValue - tol) && diffDays <= rule.triggerValue + tol;
          break;
        case 'day_after_arrival':
          matched = diffDays >= 0 && diffDays <= rule.triggerValue + tol;
          break;
        case 'days_after_first_purchase':
          matched = patient.tags.includes('新客') && diffDays >= 1 && diffDays <= rule.triggerValue + tol;
          break;
      }
      if (!matched) return;

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
        id: `task-${(tasks.length + 1).toString().padStart(3, '0')}`,
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
    });
  });

  return tasks;
}

export const callTasks: CallTask[] = generateCallTasks();
