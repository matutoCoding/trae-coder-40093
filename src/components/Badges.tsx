import type { Priority, CallTaskStatus, CallResult, MemberLevel, PharmacistTaskPriority, PharmacistTaskStatus } from '@/types';
import { CALL_RESULT_LABELS, CALL_RESULT_COLORS } from '@/types';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = {
    high: { label: '高', className: 'bg-danger-50 text-danger-700 border-danger-200', dot: 'bg-danger-500' },
    medium: { label: '中', className: 'bg-warn-50 text-warn-700 border-warn-200', dot: 'bg-warn-500' },
    low: { label: '低', className: 'bg-trust-50 text-trust-700 border-trust-200', dot: 'bg-trust-500' },
  }[priority];

  return (
    <span className={`badge border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}优先级
    </span>
  );
}

export function PriorityBar({ priority }: { priority: Priority }) {
  const className = {
    high: 'priority-bar-high',
    medium: 'priority-bar-medium',
    low: 'priority-bar-low',
  }[priority];
  return <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${className}`}></div>;
}

export function TaskStatusBadge({ status }: { status: CallTaskStatus }) {
  const config = {
    pending: { label: '待拨打', className: 'bg-slate-100 text-slate-600 border-slate-200' },
    calling: { label: '拨打中', className: 'bg-medical-50 text-medical-700 border-medical-200 animate-pulse' },
    completed: { label: '已完成', className: 'bg-trust-50 text-trust-700 border-trust-200' },
    failed: { label: '已结束', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  }[status];
  return <span className={`badge border ${config.className}`}>{config.label}</span>;
}

export function CallResultBadge({ result }: { result: CallResult }) {
  return (
    <span className={`badge border ${CALL_RESULT_COLORS[result]}`}>
      {CALL_RESULT_LABELS[result]}
    </span>
  );
}

export function MemberLevelBadge({ level }: { level: MemberLevel }) {
  const config = {
    '普通': { className: 'bg-slate-100 text-slate-600 border-slate-200' },
    '银卡': { className: 'bg-zinc-100 text-zinc-700 border-zinc-300' },
    '金卡': { className: 'bg-amber-50 text-amber-700 border-amber-200' },
    '钻石': { className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  }[level];
  return <span className={`badge border ${config.className}`}>{level}会员</span>;
}

export function PharmacistPriorityBadge({ priority }: { priority: PharmacistTaskPriority }) {
  const config = {
    urgent: { label: '紧急', className: 'bg-danger-50 text-danger-700 border-danger-200' },
    normal: { label: '普通', className: 'bg-medical-50 text-medical-700 border-medical-200' },
    low: { label: '低', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  }[priority];
  return <span className={`badge border ${config.className}`}>{config.label}</span>;
}

export function PharmacistStatusBadge({ status }: { status: PharmacistTaskStatus }) {
  const config = {
    pending: { label: '待处理', className: 'bg-warn-50 text-warn-700 border-warn-200' },
    processing: { label: '处理中', className: 'bg-medical-50 text-medical-700 border-medical-200' },
    completed: { label: '已完成', className: 'bg-trust-50 text-trust-700 border-trust-200' },
  }[status];
  return <span className={`badge border ${config.className}`}>{config.label}</span>;
}

export function RuleEnabledBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <span className="badge border bg-trust-50 text-trust-700 border-trust-200">
      <span className="w-1.5 h-1.5 rounded-full bg-trust-500"></span>
      已启用
    </span>
  ) : (
    <span className="badge border bg-slate-100 text-slate-500 border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      已停用
    </span>
  );
}

export function SwitchToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-medical-500/30 ${
        checked ? 'bg-trust-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
