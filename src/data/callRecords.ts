import type { CallRecord, CallResult } from '@/types';
import { callTasks } from './callTasks';
import dayjs from 'dayjs';

const results: CallResult[] = [
  'connected', 'connected', 'connected',
  'no_answer', 'no_answer',
  'pharmacist_followup',
  'self_discontinued',
  'wrong_number',
  'refused',
  'appointment',
  'purchased',
];

const quoteExamples: Record<CallResult, string[]> = {
  connected: [
    '药还有大概一周的量，最近感觉身体状态还可以，就是偶尔有点乏力。',
    '一切正常，已经按时按量吃了，没有不舒服的地方。',
    '血压控制得不错，早上测的130/85，药还有半盒。',
    '血糖最近有点波动，可能是饮食没注意，其他都还好。',
  ],
  no_answer: [
    '连续拨打3次无人接听，已发短信提醒。',
    '电话响铃后挂断，可能在忙。',
  ],
  pharmacist_followup: [
    '患者反映最近皮疹比较严重，想知道是不是药物副作用，是否需要减量。',
    '说最近肝功能指标有点升高，想咨询要不要停药或者加保肝药。',
    '出现腹泻症状，每天3-4次，想知道是否正常，需要处理吗？',
  ],
  self_discontinued: [
    '说感觉好了就自己停药了，劝了也不听，说副作用太大受不了。',
    '经济原因停药，说药太贵了吃不起，问有没有便宜的替代方案。',
    '忘记吃了，停了大概5天，现在想起来又开始吃了。',
  ],
  wrong_number: [
    '接电话的人说不认识患者，可能是留错号码了。',
  ],
  refused: [
    '说没时间，不愿意配合回访。',
    '情绪不好，直接挂电话了。',
  ],
  appointment: [
    '约了明天下午3点再联系，现在在开会不方便。',
    '说晚上8点以后在家，到时再打电话。',
  ],
  purchased: [
    '说昨天刚去门店买了两个月的量，药师推荐搭配了维生素。',
    '已经在线上下单了，快递明天到。',
  ],
};

const operators = [
  { id: 'op-001', name: '李静' },
  { id: 'op-002', name: '王芳' },
  { id: 'op-003', name: '赵雪' },
  { id: 'op-004', name: '孙倩' },
];

const commonTags = ['按时服药', '状态良好', '需提醒', '老年沟通慢', '态度友善', '担心费用'];

export function generateCallRecords(): CallRecord[] {
  const records: CallRecord[] = [];
  let idx = 0;

  callTasks.filter(t => t.status === 'completed' || t.status === 'failed').forEach((task) => {
    const result = results[idx % results.length];
    const quotes = quoteExamples[result];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const operator = operators[idx % operators.length];
    const needPharmacist = result === 'pharmacist_followup' || result === 'self_discontinued';
    const numTags = Math.floor(Math.random() * 2) + 1;
    const tags: string[] = [];
    for (let i = 0; i < numTags; i++) {
      const t = commonTags[Math.floor(Math.random() * commonTags.length)];
      if (!tags.includes(t)) tags.push(t);
    }

    records.push({
      id: `record-${(idx + 1).toString().padStart(3, '0')}`,
      taskId: task.id,
      patientId: task.patientId,
      result,
      patientQuote: quote,
      tags,
      needPharmacistFollowup: needPharmacist,
      pharmacistFollowupReason: needPharmacist ? quote : undefined,
      appointmentTime: result === 'appointment' ? dayjs().add(1, 'day').format('YYYY-MM-DD HH:mm') : undefined,
      callDuration: result === 'no_answer' ? 0 : Math.floor(Math.random() * 240) + 30,
      createdAt: dayjs().subtract(Math.floor(Math.random() * 8), 'hour').toISOString(),
      operatorId: operator.id,
      operatorName: operator.name,
    });
    idx++;
  });

  return records;
}

export const callRecords: CallRecord[] = generateCallRecords();
