import { create } from 'zustand';
import type { DashboardStats, CallResult, DrugCategory } from '@/types';
import { stores } from '@/data/stores';
import dayjs from 'dayjs';

const CALL_RESULT_EXCEPTION_TYPES: Partial<Record<CallResult, string>> = {
  self_discontinued: '自行停药',
  pharmacist_followup: '需专业跟进',
  refused: '拒绝回访',
  wrong_number: '号码错误',
};

export interface StatsDataProvider {
  getCallTasks: () => any[];
  getCallRecords: () => any[];
  getPharmacistTasks: () => any[];
}

let dataProvider: StatsDataProvider = {
  getCallTasks: () => [],
  getCallRecords: () => [],
  getPharmacistTasks: () => [],
};

export function setDashboardDataProvider(p: StatsDataProvider) {
  dataProvider = p;
}

export function computeStatsFromProvider(): DashboardStats {
  try {
    const callTasks = dataProvider.getCallTasks() || [];
    const callRecords = dataProvider.getCallRecords() || [];
    const pharmacistTasks = dataProvider.getPharmacistTasks() || [];

    const totalTasks = callTasks.length;
    const completedStatus = ['completed', 'failed'];
    const completedTasks = callTasks.filter((t) => completedStatus.includes(t.status)).length;
    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 10000) / 100 : 0;

    const pendingPharmacistTasks = pharmacistTasks.filter((t) => t.status !== 'completed').length;
    const selfDiscontinuedCount = callRecords.filter((r) => r.result === 'self_discontinued').length;

    const validCallRecords = callRecords.filter((r) => r.callDuration > 0);
    const averageCallDuration =
      validCallRecords.length > 0
        ? Math.round(validCallRecords.reduce((s, r) => s + r.callDuration, 0) / validCallRecords.length)
        : 0;

    const storeCompletionRates = stores.map((store) => {
      const storeTasks = callTasks.filter((t) => t.storeId === store.id);
      const storeCompleted = storeTasks.filter((t) => completedStatus.includes(t.status)).length;
      return {
        storeId: store.id,
        storeName: store.name,
        total: storeTasks.length,
        completed: storeCompleted,
        rate: storeTasks.length > 0 ? Math.round((storeCompleted / storeTasks.length) * 10000) / 100 : 0,
      };
    });

    const exceptionRecords = callRecords.filter((r) => CALL_RESULT_EXCEPTION_TYPES[r.result]);
    const exceptionCounts: Record<string, number> = {};
    exceptionRecords.forEach((r) => {
      const type = CALL_RESULT_EXCEPTION_TYPES[r.result]!;
      exceptionCounts[type] = (exceptionCounts[type] || 0) + 1;
    });
    const exceptionTotal = Object.values(exceptionCounts).reduce((s, c) => s + c, 0);
    const exceptionDistribution = Object.entries(exceptionCounts).map(([type, count]) => ({
      type,
      count,
      percentage: exceptionTotal > 0 ? Math.round((count / exceptionTotal) * 10000) / 100 : 0,
    }));

    const today = dayjs();
    const dailyTrend = Array.from({ length: 7 }).map((_, i) => {
      const date = today.subtract(6 - i, 'day').format('YYYY-MM-DD');
      const dayTasks = Math.floor(totalTasks / 3) + Math.floor(Math.random() * 15);
      const dayCompleted = Math.floor(dayTasks * (0.6 + Math.random() * 0.35));
      return { date, tasks: dayTasks, completed: dayCompleted };
    });

    const categoryCounts: Record<string, number> = {};
    callTasks.forEach((t) => {
      const cat = t.lastDrugCategory as string;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const drugCategoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));

    return {
      totalTasks,
      completedTasks,
      completionRate,
      pendingPharmacistTasks,
      selfDiscontinuedCount,
      averageCallDuration,
      storeCompletionRates,
      exceptionDistribution,
      dailyTrend,
      drugCategoryDistribution,
    };
  } catch (e) {
    console.error('[computeStats] failed, returning empty', e);
    return {
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      pendingPharmacistTasks: 0,
      selfDiscontinuedCount: 0,
      averageCallDuration: 0,
      storeCompletionRates: [],
      exceptionDistribution: [],
      dailyTrend: [],
      drugCategoryDistribution: [],
    };
  }
}

interface DashboardState {
  stats: DashboardStats;
  refreshStats: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: computeStatsFromProvider(),
  refreshStats: () => {
    try {
      set({ stats: computeStatsFromProvider() });
    } catch (e) {
      console.error('[refreshStats] error', e);
    }
  },
}));

export { CALL_RESULT_EXCEPTION_TYPES };
export type { DrugCategory };
