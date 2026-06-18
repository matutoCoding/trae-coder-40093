import type { PharmacistTask, PharmacistTaskStatus, PharmacistTaskPriority } from '@/types';
import { callRecords } from './callRecords';
import { patients } from './patients';
import dayjs from 'dayjs';

const statuses: PharmacistTaskStatus[] = ['pending', 'pending', 'processing', 'completed'];
const priorities: PharmacistTaskPriority[] = ['urgent', 'normal', 'normal', 'low'];

export function generatePharmacistTasks(): PharmacistTask[] {
  const tasks: PharmacistTask[] = [];
  const needFollowupRecords = callRecords.filter(r => r.needPharmacistFollowup);

  needFollowupRecords.forEach((record, idx) => {
    const patient = patients.find(p => p.id === record.patientId);
    if (!patient) return;

    const status = statuses[idx % statuses.length];
    const priority = priorities[idx % priorities.length];
    const createdAt = dayjs(record.createdAt).add(idx % 5, 'minute').toISOString();

    tasks.push({
      id: `phtask-${(idx + 1).toString().padStart(3, '0')}`,
      callRecordId: record.id,
      patientId: record.patientId,
      pharmacistId: patient.pharmacistId,
      storeId: patient.storeId,
      reason: record.pharmacistFollowupReason || record.patientQuote,
      priority,
      status,
      note: status !== 'pending' ? '已联系患者，建议观察2天，如症状持续返院检查。' : undefined,
      handleResult: status === 'completed' ? '患者症状缓解，已继续按原剂量服药，嘱咐如有异常及时联系。' : undefined,
      createdAt,
      handledAt: status === 'completed' ? dayjs(createdAt).add(2 + idx, 'hour').toISOString() : undefined,
    });
  });

  return tasks;
}

export const pharmacistTasks: PharmacistTask[] = generatePharmacistTasks();
