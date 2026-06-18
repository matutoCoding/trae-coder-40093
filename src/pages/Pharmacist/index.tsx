import { useState } from 'react';
import {
  Pill, User, Phone, Clock, MessageSquare, AlertTriangle,
  ChevronDown, Search, Filter, CheckCircle2, Loader2, Send,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { usePharmacistTaskStore } from '@/store/pharmacistTaskStore';
import { patients } from '@/data/patients';
import { pharmacists as allPharmacists } from '@/data/pharmacists';
import { stores } from '@/data/stores';
import { PharmacistPriorityBadge, PharmacistStatusBadge, MemberLevelBadge } from '@/components/Badges';
import type { PharmacistTaskPriority, PharmacistTaskStatus } from '@/types';
import { fromNow, dayjs } from '@/utils/date';

function PharmacistWorkspace() {
  const {
    pharmacistTasks,
    updateTaskStatus,
    addNote,
    getTasksByPharmacist,
  } = usePharmacistTaskStore();

  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');
  const [pharmacistFilter, setPharmacistFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState<PharmacistTaskPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PharmacistTaskStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [handleText, setHandleText] = useState('');
  const [resultText, setResultText] = useState('');

  const filtered = pharmacistTasks.filter((t) => {
    const patient = patients.find((p) => p.id === t.patientId);
    const pharmacist = allPharmacists.find((p) => p.id === t.pharmacistId);
    if (!patient) return false;
    const matchSearch =
      !search ||
      patient.name.includes(search) ||
      t.reason.includes(search) ||
      (pharmacist?.name || '').includes(search);
    const matchStore = storeFilter === 'all' || t.storeId === storeFilter;
    const matchPharm = pharmacistFilter === 'all' || t.pharmacistId === pharmacistFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStore && matchPharm && matchPriority && matchStatus;
  });

  const pendingCount = pharmacistTasks.filter((t) => t.status === 'pending').length;
  const processingCount = pharmacistTasks.filter((t) => t.status === 'processing').length;
  const completedCount = pharmacistTasks.filter((t) => t.status === 'completed').length;
  const urgentCount = pharmacistTasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed').length;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setHandleText('');
    setResultText('');
  };

  const startProcessing = (task: any) => {
    updateTaskStatus(task.id, 'processing');
  };

  const completeTask = (task: any) => {
    if (!resultText.trim()) {
      alert('请填写处理结果');
      return;
    }
    addNote(task.id, handleText || task.note || '', resultText);
    updateTaskStatus(task.id, 'completed');
    setExpandedId(null);
  };

  return (
    <div>
      <PageHeader
        title="药师工作台"
        subtitle="处理客服推送的专业问题，跟进患者用药情况"
        icon={<Pill className="w-6 h-6 text-white" />}
        stats={[
          { label: '待处理', value: pendingCount, color: 'text-warn-600' },
          { label: '处理中', value: processingCount, color: 'text-medical-600' },
          { label: '已完成', value: completedCount, color: 'text-trust-600' },
          { label: '紧急任务', value: urgentCount, color: 'text-danger-600' },
        ]}
      />

      <div className="card p-4 mb-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-base pl-9"
              placeholder="搜索患者姓名、药师、问题内容..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            {[
              {
                label: '门店',
                value: storeFilter,
                setter: setStoreFilter,
                options: stores.map((s) => ({ v: s.id, l: s.name })),
              },
              {
                label: '药师',
                value: pharmacistFilter,
                setter: setPharmacistFilter,
                options: allPharmacists.map((p) => ({ v: p.id, l: p.name })),
              },
              {
                label: '紧急度',
                value: priorityFilter,
                setter: setPriorityFilter,
                options: [
                  { v: 'urgent', l: '紧急' },
                  { v: 'normal', l: '普通' },
                  { v: 'low', l: '低' },
                ],
              },
              {
                label: '状态',
                value: statusFilter,
                setter: setStatusFilter,
                options: [
                  { v: 'pending', l: '待处理' },
                  { v: 'processing', l: '处理中' },
                  { v: 'completed', l: '已完成' },
                ],
              },
            ].map((f) => (
              <div key={f.label} className="relative">
                <select
                  className="input-base pr-9 appearance-none cursor-pointer text-sm py-1.5 min-w-[110px]"
                  value={f.value}
                  onChange={(e) => (f.setter as any)(e.target.value)}
                >
                  <option value="all">{f.label}</option>
                  {f.options.map((o) => (
                    <option key={o.v} value={o.v}>
                      {o.l}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto text-trust-400 mb-4" />
            <p className="text-slate-500 text-lg mb-1">太棒了！</p>
            <p className="text-slate-400">当前没有待处理的专业问题</p>
          </div>
        ) : (
          filtered.map((task) => {
            const patient = patients.find((p) => p.id === task.patientId);
            const pharmacist = allPharmacists.find((p) => p.id === task.pharmacistId);
            const store = stores.find((s) => s.id === task.storeId);
            if (!patient) return null;
            const expanded = expandedId === task.id;
            const createdAt = dayjs(task.createdAt);
            const waitHours = dayjs().diff(createdAt, 'hour');

            return (
              <div key={task.id} className="card overflow-hidden">
                <div
                  className={`p-5 cursor-pointer transition-colors hover:bg-slate-50/50 ${
                    task.status === 'pending' && task.priority === 'urgent'
                      ? 'border-l-4 border-l-danger-500'
                      : task.status === 'processing'
                      ? 'border-l-4 border-l-medical-500'
                      : task.status === 'completed'
                      ? 'border-l-4 border-l-trust-500'
                      : 'border-l-4 border-l-warn-500'
                  }`}
                  onClick={() => toggleExpand(task.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md shrink-0 ${
                        patient.gender === '男'
                          ? 'bg-gradient-to-br from-medical-400 to-medical-600'
                          : 'bg-gradient-to-br from-pink-400 to-pink-600'
                      }`}>
                        {patient.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-slate-800">{patient.name}</span>
                          <MemberLevelBadge level={patient.memberLevel} />
                          <PharmacistPriorityBadge priority={task.priority} />
                          <PharmacistStatusBadge status={task.status} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {patient.gender}{patient.age}岁 · {patient.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Pill className="w-3.5 h-3.5" />
                            {patient.lastDrugName}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {store?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            负责药师：{pharmacist?.name} ({pharmacist?.title})
                          </span>
                          <span className={`flex items-center gap-1 ${waitHours > 4 && task.status === 'pending' ? 'text-danger-500 font-medium' : ''}`}>
                            <Clock className="w-3.5 h-3.5" />
                            创建于 {createdAt.format('MM-DD HH:mm')}
                            {task.status !== 'completed' && `（已等待${waitHours}小时）`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="max-w-sm p-3 rounded-xl bg-gradient-to-r from-warn-50 to-danger-50 border border-warn-100">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-warn-700 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          问题描述
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{task.reason}</p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {expanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-5 bg-slate-50/30 animate-fade-in">
                    {task.status !== 'completed' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="label-base flex items-center gap-1.5">
                            <Phone className="w-4 h-4 text-medical-500" />
                            联系电话
                          </label>
                          <div className="input-base bg-white flex items-center justify-between">
                            <span className="font-mono">{patient.phone}</span>
                            <a
                              href={`tel:${patient.phone}`}
                              className="text-medical-600 hover:text-medical-700 text-sm font-medium inline-flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              一键拨打
                            </a>
                          </div>
                        </div>
                        <div>
                          <label className="label-base">最近购药</label>
                          <div className="input-base bg-white">
                            {patient.lastDrugName}（{fromNow(patient.lastPurchaseDate)}）
                          </div>
                        </div>
                      </div>
                    )}

                    {task.note && (
                      <div>
                        <label className="label-base">跟进备注</label>
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 leading-relaxed">
                          {task.note}
                        </div>
                      </div>
                    )}

                    {task.status === 'completed' && task.handleResult && (
                      <div className="p-4 rounded-xl bg-trust-50 border border-trust-200">
                        <div className="flex items-center gap-2 text-sm font-bold text-trust-700 mb-2">
                          <CheckCircle2 className="w-4 h-4" />
                          处理结果（{dayjs(task.handledAt).format('MM-DD HH:mm')}）
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{task.handleResult}</p>
                      </div>
                    )}

                    {task.status === 'pending' && (
                      <div className="flex justify-end">
                        <button
                          className="btn-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            startProcessing(task);
                          }}
                        >
                          <Loader2 className="w-4 h-4" />
                          开始处理
                        </button>
                      </div>
                    )}

                    {task.status === 'processing' && (
                      <div className="space-y-4">
                        <div>
                          <label className="label-base">本次跟进备注</label>
                          <textarea
                            className="input-base min-h-[80px] resize-none bg-white"
                            placeholder="记录与患者沟通的内容和建议..."
                            value={handleText}
                            onChange={(e) => setHandleText(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div>
                          <label className="label-base">处理结果 <span className="text-danger-500">*</span></label>
                          <textarea
                            className="input-base min-h-[100px] resize-none bg-white"
                            placeholder="请详细填写处理方案、用药建议、患者反馈等，供后续参考..."
                            value={resultText}
                            onChange={(e) => setResultText(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!handleText.trim()) return;
                              addNote(task.id, handleText, undefined);
                              setHandleText('');
                              alert('备注已保存');
                            }}
                          >
                            暂存备注
                          </button>
                          <button
                            className="btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              completeTask(task);
                            }}
                          >
                            <Send className="w-4 h-4" />
                            提交完成
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PharmacistWorkspace;
