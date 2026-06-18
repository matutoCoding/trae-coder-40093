import { useState, useMemo } from 'react';
import {
  PhoneCall, Search, Filter, Phone, User, Building2, Pill,
  Calendar, Clock, ChevronDown, X, History, ShoppingBag,
  MessageSquare, Stethoscope, AlertTriangle, Sparkles, ClipboardList,
  Info, Target,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useCallTaskStore } from '@/store/callTaskStore';
import { useRulesStore } from '@/store/rulesStore';
import { patients } from '@/data/patients';
import { pharmacists } from '@/data/pharmacists';
import { stores } from '@/data/stores';
import { PriorityBadge, PriorityBar, TaskStatusBadge, MemberLevelBadge } from '@/components/Badges';
import type { CallTask, DrugCategory, Priority, CallTaskStatus } from '@/types';
import { TRIGGER_TOLERANCE_LABELS } from '@/types';
import { fromNow, dayjs } from '@/utils/date';

const DRUG_CATEGORIES: DrugCategory[] = [
  '抗肿瘤靶向药', '自身免疫抑制剂', '冷链生物制剂', '抗病毒药物',
  '心血管慢病药', '糖尿病用药', '罕见病特效药',
];

interface PatientDrawerProps {
  task: CallTask;
  onClose: () => void;
  onStartCall: () => void;
}

function PatientDrawer({ task, onClose, onStartCall }: PatientDrawerProps) {
  const patient = patients.find(p => p.id === task.patientId);
  const pharmacist = pharmacists.find(p => p.id === task.pharmacistId);
  const store = stores.find(s => s.id === task.storeId);
  const rule = useRulesStore((s) => s.getRuleById)(task.ruleId);
  const keyPoints = rule?.keyPoints || task.keyPoints;
  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-up">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">患者详情</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className={`card p-5 relative overflow-hidden`}>
            <PriorityBar priority={task.priority} />
            <div className="pl-3">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                    patient.gender === '男'
                      ? 'bg-gradient-to-br from-medical-400 to-medical-600'
                      : 'bg-gradient-to-br from-pink-400 to-pink-600'
                  }`}>
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-slate-800">{patient.name}</h4>
                      <MemberLevelBadge level={patient.memberLevel} />
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      {patient.gender} · {patient.age}岁 · {patient.phone}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {patient.tags.map(t => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <PriorityBadge priority={task.priority} />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-medical-500" />
                  <span className="text-slate-600">{store?.name || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="w-4 h-4 text-trust-500" />
                  <span className="text-slate-600">{pharmacist?.name} ({pharmacist?.title})</span>
                </div>
                <div className="col-span-2 flex items-center gap-2 text-sm">
                  <ClipboardList className="w-4 h-4 text-medical-500" />
                  <span className="text-slate-500 shrink-0">回访规则：</span>
                  <span className="text-slate-700 font-medium truncate">{rule?.name || '未匹配规则'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ShoppingBag className="w-4 h-4 text-warn-500" />
                  <span className="text-slate-600">上次购药 {fromNow(patient.lastPurchaseDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Pill className="w-4 h-4 text-danger-500" />
                  <span className="text-slate-600 truncate">{patient.lastDrugName}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h5 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-medical-500" />
              本次回访话术重点
            </h5>
            <div className="bg-gradient-to-r from-medical-50 to-trust-50/50 rounded-xl p-4 border border-medical-100 mb-4">
              <p className="text-sm text-slate-700 leading-relaxed">{rule?.scriptTemplate}</p>
            </div>
            <ul className="space-y-2">
              {keyPoints.map((kp, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-medical-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700 leading-relaxed pt-0.5">{kp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h5 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-warn-500" />
              购药历史（最近）
            </h5>
            <div className="space-y-3">
              {[
                { date: patient.lastPurchaseDate, drug: patient.lastDrugName, cat: patient.lastDrugCategory, qty: '1盒', amount: patient.totalPurchaseAmount > 5000 ? '¥5,980' : '¥2,680' },
                { date: dayjs(patient.lastPurchaseDate).subtract(30, 'day').format('YYYY-MM-DD'), drug: patient.lastDrugName, cat: patient.lastDrugCategory, qty: '1盒', amount: patient.totalPurchaseAmount > 5000 ? '¥5,980' : '¥2,680' },
                { date: dayjs(patient.lastPurchaseDate).subtract(60, 'day').format('YYYY-MM-DD'), drug: patient.lastDrugName, cat: patient.lastDrugCategory, qty: '1盒', amount: patient.totalPurchaseAmount > 5000 ? '¥5,980' : '¥2,680' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{r.drug}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{r.cat} · {r.qty}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">{r.amount}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{r.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h5 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-trust-500" />
              历史回访记录
            </h5>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-trust-700 bg-trust-50 px-2 py-0.5 rounded-full">已接通</span>
                  <span className="text-xs text-slate-400">{dayjs().subtract(30, 'day').format('MM-DD HH:mm')}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">患者表示身体状态稳定，按时服药无异常，剩余药量还可服用5天。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button className="btn-primary w-full h-12 text-base" onClick={onStartCall}>
            <Phone className="w-5 h-5" />
            开始拨打回访电话
          </button>
        </div>
      </div>
    </div>
  );
}

function CallList() {
  const navigate = useNavigate();
  const { callTasks, getPendingTasksSorted, updateTaskStatus } = useCallTaskStore();
  const getRuleById = useRulesStore((s) => s.getRuleById);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<DrugCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CallTaskStatus | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<CallTask | null>(null);
  const [showMatchInfo, setShowMatchInfo] = useState(false);

  const tasks = useMemo(() => {
    const list = statusFilter === 'all' ? getPendingTasksSorted() : callTasks.filter(t => t.status === statusFilter);
    return list.filter((t) => {
      const patient = patients.find(p => p.id === t.patientId);
      if (!patient) return false;
      const matchSearch = !search || patient.name.includes(search) || patient.phone.includes(search) || t.lastDrugName.includes(search);
      const matchStore = storeFilter === 'all' || t.storeId === storeFilter;
      const matchCat = categoryFilter === 'all' || t.lastDrugCategory === categoryFilter;
      const matchPri = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchSearch && matchStore && matchCat && matchPri;
    });
  }, [callTasks, getPendingTasksSorted, search, storeFilter, categoryFilter, priorityFilter, statusFilter]);

  const stats = [
    { label: '今日待回访', value: callTasks.filter(t => t.status === 'pending').length, color: 'text-warn-600' },
    { label: '拨打中', value: callTasks.filter(t => t.status === 'calling').length, color: 'text-medical-600' },
    { label: '已完成', value: callTasks.filter(t => t.status === 'completed').length, color: 'text-trust-600' },
    { label: '高优先级', value: callTasks.filter(t => t.priority === 'high' && t.status === 'pending').length, color: 'text-danger-600' },
  ];

  const startCall = (task: CallTask) => {
    updateTaskStatus(task.id, 'calling');
    setSelectedTask(null);
    navigate(`/register/${task.id}`);
  };

  return (
    <div>
      <PageHeader
        title="待拨名单"
        subtitle={`${dayjs().format('YYYY年MM月DD日')} 今日回访任务，按优先级排序处理`}
        icon={<PhoneCall className="w-6 h-6 text-white" />}
        stats={stats}
      />

      <div className="card p-4 mb-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-base pl-9"
              placeholder="搜索患者姓名、手机号、药品名..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            {[
              { label: '门店', value: storeFilter, setter: setStoreFilter, options: stores.map(s => ({ v: s.id, l: s.name })) },
              { label: '药品', value: categoryFilter, setter: setCategoryFilter, options: DRUG_CATEGORIES.map(c => ({ v: c, l: c })) },
              { label: '优先级', value: priorityFilter, setter: setPriorityFilter, options: [{ v: 'high', l: '高' }, { v: 'medium', l: '中' }, { v: 'low', l: '低' }] },
              { label: '状态', value: statusFilter, setter: setStatusFilter, options: [{ v: 'pending', l: '待拨打' }, { v: 'calling', l: '拨打中' }, { v: 'completed', l: '已完成' }] },
            ].map(f => (
              <div key={f.label} className="relative">
                <select
                  className="input-base pr-9 appearance-none cursor-pointer text-sm py-1.5 min-w-[110px]"
                  value={f.value}
                  onChange={(e) => (f.setter as (v: any) => void)(e.target.value)}
                >
                  <option value="all">{f.label}</option>
                  {f.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            ))}
            <button
              className="btn-primary text-sm py-1.5 px-4 ml-auto"
              onClick={() => setShowMatchInfo(true)}
            >
              <Info className="w-3.5 h-3.5" />
              生成说明
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        {tasks.map((task, idx) => {
          const patient = patients.find(p => p.id === task.patientId);
          const pharmacist = pharmacists.find(p => p.id === task.pharmacistId);
          const store = stores.find(s => s.id === task.storeId);
          const rule = getRuleById(task.ruleId);
          const keyPoints = rule?.keyPoints || task.keyPoints;
          if (!patient) return null;
          const daysAgo = dayjs().diff(task.lastPurchaseDate, 'day');

          return (
            <div
              key={task.id}
              className="card-hover relative overflow-hidden cursor-pointer group"
              onClick={() => setSelectedTask(task)}
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              <PriorityBar priority={task.priority} />
              <div className="p-5 pl-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-md shrink-0 ${
                      patient.gender === '男'
                        ? 'bg-gradient-to-br from-medical-400 to-medical-600'
                        : 'bg-gradient-to-br from-pink-400 to-pink-600'
                    }`}>
                      {patient.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 truncate">{patient.name}</span>
                        <TaskStatusBadge status={task.status} />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        {patient.gender}{patient.age}岁 · {patient.phone.slice(0, 3)}****{patient.phone.slice(-4)}
                      </div>
                    </div>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-medical-500 shrink-0" />
                    <span className="truncate">{store?.name}</span>
                    <span className="mx-1 text-slate-300">|</span>
                    <Stethoscope className="w-3.5 h-3.5 text-trust-500 shrink-0" />
                    <span>{pharmacist?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-medical-400 shrink-0" />
                    <span className="truncate text-slate-700 font-medium">{rule?.name || '未匹配规则'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Pill className="w-3.5 h-3.5 text-warn-500 shrink-0" />
                    <span className="truncate font-medium">{task.lastDrugName}</span>
                    <span className="tag py-0 text-[10px]">{task.lastDrugCategory}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-danger-500 shrink-0" />
                    <span>上次购药：{task.lastPurchaseDate}（{daysAgo}天前）</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-medical-50/80 to-trust-50/50 rounded-xl p-3 border border-medical-100/60 mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-medical-700 mb-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    话术重点
                  </div>
                  <ul className="space-y-0.5">
                    {keyPoints.slice(0, 2).map((kp, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-medical-500 mt-0.5">•</span>
                        <span className="line-clamp-1">{kp}</span>
                      </li>
                    ))}
                    {keyPoints.length > 2 && (
                      <li className="text-xs text-slate-400">另有{keyPoints.length - 2}项重点...</li>
                    )}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className={`flex items-center gap-1 ${task.callCount > 0 ? 'text-warn-600 font-medium' : ''}`}>
                      <Clock className="w-3 h-3" />
                      第{task.callCount + 1}次拨打
                    </span>
                    {task.status !== 'pending' && <TaskStatusBadge status={task.status} />}
                  </div>
                  <button
                    className="btn-primary !py-1.5 !px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      startCall(task);
                    }}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    开始回访
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="col-span-full card p-16 text-center">
            <PhoneCall className="w-20 h-20 mx-auto text-slate-300 mb-4" />
            <div className="text-slate-500 text-lg font-medium mb-2">今日任务已全部完成 🎉</div>
            <div className="text-slate-400 text-sm">明日凌晨系统将自动生成新的回访名单</div>
          </div>
        )}
      </div>

      {selectedTask && (
        <PatientDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStartCall={() => startCall(selectedTask)}
        />
      )}

      {showMatchInfo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowMatchInfo(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Target className="w-5 h-5 text-medical-500" />
                今日名单生成说明
              </h3>
              <button onClick={() => setShowMatchInfo(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              <div className="mb-4 p-4 rounded-xl bg-medical-50/60 border border-medical-100">
                <p className="text-sm text-slate-600">
                  以下列表说明今日待拨名单中每条任务的匹配来源：由哪条规则触发、患者购药距今天数、匹配口径范围、药品类别。
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-3 text-slate-600 font-semibold">患者</th>
                      <th className="text-left py-3 px-3 text-slate-600 font-semibold">门店</th>
                      <th className="text-left py-3 px-3 text-slate-600 font-semibold">规则名称</th>
                      <th className="text-left py-3 px-3 text-slate-600 font-semibold">触发方式</th>
                      <th className="text-left py-3 px-3 text-slate-600 font-semibold">匹配口径</th>
                      <th className="text-left py-3 px-3 text-slate-600 font-semibold">药品类别</th>
                      <th className="text-left py-3 px-3 text-slate-600 font-semibold">上次购药</th>
                      <th className="text-right py-3 px-3 text-slate-600 font-semibold">天数差</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => {
                      const p = patients.find((x) => x.id === t.patientId);
                      const s = stores.find((x) => x.id === t.storeId);
                      const mr = t.matchReason;
                      return (
                        <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-medium text-slate-800">{p?.name || '-'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{s?.name || '-'}</td>
                          <td className="py-2.5 px-3">
                            <span className="text-medical-700 font-medium">{mr.ruleName}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {mr.triggerType === 'days_after_purchase' ? '购药后' : mr.triggerType === 'day_after_arrival' ? '到货后' : '首购后'}第{mr.triggerValue}天
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-medical-50 text-medical-700 border border-medical-100">
                              {TRIGGER_TOLERANCE_LABELS[mr.triggerTolerance]}
                            </span>
                            <span className="text-xs text-slate-400 ml-1">
                              {mr.triggerTolerance === 0 ? `仅第${mr.triggerValue}天` : `第${Math.max(1, mr.triggerValue - mr.triggerTolerance)}~${mr.triggerValue + mr.triggerTolerance}天`}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="tag py-0 text-[10px]">{mr.drugCategory}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{mr.patientLastPurchaseDate}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`font-mono font-bold ${mr.daysDiff === mr.triggerValue ? 'text-trust-600' : 'text-warn-600'}`}>
                              {mr.daysDiff}天
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CallList;
