import { useEffect, useRef } from 'react';
import { subscribeRulesChanges, useRulesStore } from '@/store/rulesStore';
import { subscribeTasksChanges, useCallTaskStore } from '@/store/callTaskStore';
import { setDashboardDataProvider, useDashboardStore } from '@/store/dashboardStore';
import { useCallRecordStore } from '@/store/callRecordStore';
import { usePharmacistTaskStore } from '@/store/pharmacistTaskStore';

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 150) {
  let timer: number | null = null;
  return function debounced(this: any, ...args: Parameters<T>) {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => fn.apply(this, args), delay) as unknown as number;
  };
}

function initDataProvider() {
  setDashboardDataProvider({
    getCallTasks: () => (useCallTaskStore.getState?.()?.callTasks as any[]) || [],
    getCallRecords: () => (useCallRecordStore.getState?.()?.callRecords as any[]) || [],
    getPharmacistTasks: () => (usePharmacistTaskStore.getState?.()?.pharmacistTasks as any[]) || [],
  });
}

export function useStoreLinker() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initDataProvider();

    const rulesSnapshot = useRulesStore.getState?.();
    const tasksSnapshot = useCallTaskStore.getState?.();

    if (rulesSnapshot && !tasksSnapshot?.callTasks?.length) {
      try {
        tasksSnapshot?.regenerateTasksFromRules?.();
      } catch (e) {
        console.warn('[bootstrap] regenerate fallback', e);
      }
    }

    useDashboardStore.getState?.()?.refreshStats?.();

    const debouncedRegen = debounce(() => {
      try { useCallTaskStore.getState?.()?.regenerateTasksFromRules?.(); } catch (e) {}
    }, 80);

    const debouncedRefresh = debounce(() => {
      try { useDashboardStore.getState?.()?.refreshStats?.(); } catch (e) {}
    }, 50);

    const unsubRules = subscribeRulesChanges(() => {
      debouncedRegen();
      setTimeout(debouncedRefresh, 80 + 30);
    });

    const unsubTasks = subscribeTasksChanges(() => {
      debouncedRefresh();
    });

    return () => {
      unsubRules?.();
      unsubTasks?.();
      initialized.current = false;
    };
  }, []);
}
