import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export function fromNow(dateStr: string): string {
  try {
    return dayjs(dateStr).fromNow();
  } catch {
    return dateStr;
  }
}

export function formatDate(dateStr: string, format = 'YYYY-MM-DD'): string {
  return dayjs(dateStr).format(format);
}

export function formatDateTime(dateStr: string, format = 'YYYY-MM-DD HH:mm'): string {
  return dayjs(dateStr).format(format);
}

export function diffDays(dateStr: string): number {
  return dayjs().diff(dateStr, 'day');
}

export { dayjs };
