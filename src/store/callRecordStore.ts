import { create } from 'zustand';
import type { CallRecord, CallResult } from '@/types';
import { callRecords as initialCallRecords } from '@/data/callRecords';

interface CallRecordState {
  callRecords: CallRecord[];
  addCallRecord: (record: Omit<CallRecord, 'id' | 'createdAt'>) => CallRecord;
  getRecordById: (id: string) => CallRecord | undefined;
  getRecordsByPatient: (patientId: string) => CallRecord[];
  getRecordsByTask: (taskId: string) => CallRecord | undefined;
  getRecordsByResult: (result: CallResult) => CallRecord[];
  getRecordsByOperator: (operatorId: string) => CallRecord[];
  getRecordsByDateRange: (startDate: string, endDate: string) => CallRecord[];
  getPharmacistFollowupRecords: () => CallRecord[];
}

export const useCallRecordStore = create<CallRecordState>((set, get) => ({
  callRecords: initialCallRecords,

  addCallRecord: (recordData) => {
    const now = new Date().toISOString();
    const newRecord: CallRecord = {
      ...recordData,
      id: `record-${Date.now()}`,
      createdAt: now,
    };
    set((state) => ({ callRecords: [...state.callRecords, newRecord] }));
    return newRecord;
  },

  getRecordById: (id) => {
    return get().callRecords.find((r) => r.id === id);
  },

  getRecordsByPatient: (patientId) => {
    return get()
      .callRecords.filter((r) => r.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getRecordsByTask: (taskId) => {
    return get().callRecords.find((r) => r.taskId === taskId);
  },

  getRecordsByResult: (result) => {
    return get().callRecords.filter((r) => r.result === result);
  },

  getRecordsByOperator: (operatorId) => {
    return get().callRecords.filter((r) => r.operatorId === operatorId);
  },

  getRecordsByDateRange: (startDate, endDate) => {
    return get().callRecords.filter((r) => {
      const date = r.createdAt.split('T')[0];
      return date >= startDate && date <= endDate;
    });
  },

  getPharmacistFollowupRecords: () => {
    return get().callRecords.filter((r) => r.needPharmacistFollowup);
  },
}));
