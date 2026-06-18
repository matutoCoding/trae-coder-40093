import type { CallTask } from '@/types';
import { patients } from './patients';
import { rules } from './rules';
import dayjs from 'dayjs';

const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'high', 'medium', 'medium', 'low'];
const statuses: Array<'pending' | 'calling' | 'completed' | 'failed'> = [
  'pending', 'pending', 'pending', 'pending', 'pending',
  'calling', 'completed', 'completed', 'failed',
];

export function generateCallTasks(): CallTask[] {
  const tasks: CallTask[] = [];
  const today = dayjs().format('YYYY-MM-DD');
  const enabledRules = rules.filter(r => r.enabled);

  patients.forEach((patient, idx) => {
    const rule = enabledRules[idx % enabledRules.length];
    const status = statuses[idx % statuses.length];
    const priority = priorities[idx % priorities.length];

    tasks.push({
      id: `task-${(idx + 1).toString().padStart(3, '0')}`,
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
      callCount: Math.floor(Math.random() * 3),
    });
  });

  return tasks;
}

export const callTasks: CallTask[] = generateCallTasks();
