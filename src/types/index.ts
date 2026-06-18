export interface Store {
  id: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
}

export interface Pharmacist {
  id: string;
  name: string;
  storeId: string;
  title: '主管药师' | '执业药师' | '药师';
  phone: string;
  avatar?: string;
}

export type MemberLevel = '普通' | '银卡' | '金卡' | '钻石';

export interface Patient {
  id: string;
  name: string;
  gender: '男' | '女';
  age: number;
  phone: string;
  storeId: string;
  pharmacistId: string;
  memberLevel: MemberLevel;
  tags: string[];
  lastPurchaseDate: string;
  lastDrugName: string;
  lastDrugCategory: DrugCategory;
  totalPurchaseAmount: number;
}

export type DrugCategory =
  | '抗肿瘤靶向药'
  | '自身免疫抑制剂'
  | '冷链生物制剂'
  | '抗病毒药物'
  | '心血管慢病药'
  | '糖尿病用药'
  | '罕见病特效药';

export type TriggerType =
  | 'days_after_purchase'
  | 'day_after_arrival'
  | 'days_after_first_purchase';

export type Priority = 'high' | 'medium' | 'low';

export type TriggerTolerance = 0 | 1 | 3;

export const TRIGGER_TOLERANCE_LABELS: Record<TriggerTolerance, string> = {
  0: '精确当天',
  1: '前后1天',
  3: '前后3天',
};

export interface Rule {
  id: string;
  name: string;
  drugCategories: DrugCategory[];
  triggerType: TriggerType;
  triggerValue: number;
  triggerTolerance: TriggerTolerance;
  priority: Priority;
  scriptTemplate: string;
  keyPoints: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CallTaskStatus = 'pending' | 'calling' | 'completed' | 'failed';

export interface MatchReason {
  ruleId: string;
  ruleName: string;
  triggerType: TriggerType;
  triggerValue: number;
  triggerTolerance: TriggerTolerance;
  drugCategory: DrugCategory;
  patientLastPurchaseDate: string;
  daysDiff: number;
}

export interface CallTask {
  id: string;
  patientId: string;
  ruleId: string;
  storeId: string;
  pharmacistId: string;
  scheduledDate: string;
  priority: Priority;
  status: CallTaskStatus;
  keyPoints: string[];
  lastDrugName: string;
  lastDrugCategory: DrugCategory;
  lastPurchaseDate: string;
  callCount: number;
  matchReason: MatchReason;
}

export type CallResult =
  | 'connected'
  | 'no_answer'
  | 'pharmacist_followup'
  | 'self_discontinued'
  | 'wrong_number'
  | 'refused'
  | 'appointment'
  | 'purchased';

export const CALL_RESULT_LABELS: Record<CallResult, string> = {
  connected: '已接通',
  no_answer: '无人接听',
  pharmacist_followup: '需药师跟进',
  self_discontinued: '已自行停药',
  wrong_number: '号码错误',
  refused: '拒绝回访',
  appointment: '预约回访',
  purchased: '已复购',
};

export const CALL_RESULT_COLORS: Record<CallResult, string> = {
  connected: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  no_answer: 'bg-amber-100 text-amber-700 border-amber-200',
  pharmacist_followup: 'bg-blue-100 text-blue-700 border-blue-200',
  self_discontinued: 'bg-red-100 text-red-700 border-red-200',
  wrong_number: 'bg-slate-100 text-slate-700 border-slate-200',
  refused: 'bg-orange-100 text-orange-700 border-orange-200',
  appointment: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  purchased: 'bg-green-100 text-green-700 border-green-200',
};

export interface CallRecord {
  id: string;
  taskId: string;
  patientId: string;
  result: CallResult;
  patientQuote: string;
  tags: string[];
  needPharmacistFollowup: boolean;
  pharmacistFollowupReason?: string;
  appointmentTime?: string;
  callDuration: number;
  createdAt: string;
  operatorId: string;
  operatorName: string;
}

export type PharmacistTaskStatus = 'pending' | 'processing' | 'completed';
export type PharmacistTaskPriority = 'urgent' | 'normal' | 'low';

export interface PharmacistTask {
  id: string;
  callRecordId: string;
  patientId: string;
  pharmacistId: string;
  storeId: string;
  reason: string;
  priority: PharmacistTaskPriority;
  status: PharmacistTaskStatus;
  note?: string;
  handleResult?: string;
  createdAt: string;
  handledAt?: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  pendingPharmacistTasks: number;
  selfDiscontinuedCount: number;
  averageCallDuration: number;
  storeCompletionRates: {
    storeId: string;
    storeName: string;
    rate: number;
    total: number;
    completed: number;
  }[];
  exceptionDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
  dailyTrend: {
    date: string;
    tasks: number;
    completed: number;
  }[];
  drugCategoryDistribution: {
    category: string;
    count: number;
  }[];
}
