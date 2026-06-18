import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ClipboardList, ArrowLeft, Phone, User, Building2, Pill, Calendar,
  CheckCircle2, XCircle, AlertTriangle, AlertOctagon, Ban,
  Clock, CheckCheck, MessageSquare, Send, Sparkles, ChevronRight,
  Play, Pause, Volume2, Stethoscope, History,
} from 'lucide-react';
import { useCallTaskStore } from '@/store/callTaskStore';
import { useCallRecordStore } from '@/store/callRecordStore';
import { usePharmacistTaskStore } from '@/store/pharmacistTaskStore';
import { patients } from '@/data/patients';
import { pharmacists } from '@/data/pharmacists';
import { stores } from '@/data/stores';
import { rules as allRules } from '@/data/rules';
import { PriorityBadge, PriorityBar, CallResultBadge } from '@/components/Badges';
import PageHeader from '@/components/PageHeader';
import type { CallResult } from '@/types';
import { CALL_RESULT_LABELS } from '@/types';

const RESULT_OPTIONS: { value: CallResult; icon: any; label: string; desc: string; color: string; bgClass: string }[] = [
  { value: 'connected', icon: CheckCircle2, label: '已接通', desc: '正常完成回访', color: 'text-trust-600', bgClass: 'peer-checked:border-trust-500 peer-checked:bg-trust-50' },
  { value: 'purchased', icon: CheckCheck, label: '已复购', desc: '患者已完成复购', color: 'text-green-600', bgClass: 'peer-checked:border-green-500 peer-checked:bg-green-50' },
  { value: 'no_answer', icon: Clock, label: '无人接听', desc: '多次拨打未接', color: 'text-amber-600', bgClass: 'peer-checked:border-amber-500 peer-checked:bg-amber-50' },
  { value: 'appointment', icon: Calendar, label: '预约回访', desc: '改约其他时间', color: 'text-cyan-600', bgClass: 'peer-checked:border-cyan-500 peer-checked:bg-cyan-50' },
  { value: 'pharmacist_followup', icon: Stethoscope, label: '需药师跟进', desc: '药理/专业问题', color: 'text-medical-600', bgClass: 'peer-checked:border-medical-500 peer-checked:bg-medical-50' },
  { value: 'self_discontinued', icon: AlertOctagon, label: '已自行停药', desc: '患者擅自停药', color: 'text-danger-600', bgClass: 'peer-checked:border-danger-500 peer-checked:bg-danger-50' },
  { value: 'refused', icon: Ban, label: '拒绝回访', desc: '患者不配合', color: 'text-orange-600', bgClass: 'peer-checked:border-orange-500 peer-checked:bg-orange-50' },
  { value: 'wrong_number', icon: XCircle, label: '号码错误', desc: '号码有误', color: 'text-slate-600', bgClass: 'peer-checked:border-slate-500 peer-checked:bg-slate-50' },
];

const QUICK_TAGS = [
  '按时服药', '状态良好', '有漏服情况', '不良反应',
  '需复购提醒', '经济困难', '老年沟通慢', '家属代接',
  '态度友好', '情绪烦躁', '建议上门', '需换药咨询',
];

const FOLLOWUP_REASONS = [
  '询问药物副作用处理', '咨询药物相互作用', '想减量或停药', '报销政策咨询', '用药方法不清楚',
];

function Register() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { getTaskById, updateTaskStatus, incrementCallCount } = useCallTaskStore();
  const { addCallRecord } = useCallRecordStore();
  const { addPharmacistTask } = usePharmacistTaskStore();

  const task = getTaskById(id);
  const patient = patients.find(p => p.id === task?.patientId);
  const pharmacist = pharmacists.find(p => p.id === task?.pharmacistId);
  const store = stores.find(s => s.id === task?.storeId);
  const rule = allRules.find(r => r.id === task?.ruleId);

  const [callDuration, setCallDuration] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [result, setResult] = useState<CallResult | null>(null);
  const [patientQuote, setPatientQuote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [needPharmacist, setNeedPharmacist] = useState(false);
  const [followupReason, setFollowupReason] = useState('');
  const [followupPriority, setFollowupPriority] = useState<'urgent' | 'normal' | 'low'>('normal');
  const [followupNote, setFollowupNote] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  useEffect(() => {
    if (task) incrementCallCount(task.id);
  }, [task, incrementCallCount]);

  useEffect(() => {
    if (!isTimerRunning) return;
    const timer = setInterval(() => {
      setCallDuration(d => d + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  if (!task || !patient) {
    return (
      <div>
        <PageHeader title="回访登记" subtitle="未找到对应的回访任务" back icon={<ClipboardList className="w-6 h-6 text-white" />} />
        <div className="card p-16 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-warn-500 mb-4" />
          <p className="text-slate-500 mb-4">未找到该回访任务，请从待拨名单进入</p>
          <button className="btn-primary" onClick={() => navigate('/call-list')}>
            <ArrowLeft className="w-4 h-4" />
            返回待拨名单
          </button>
        </div>
      </div>
    );
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const submit = () => {
    if (!result) {
      alert('请选择回访结果');
      return;
    }

    const finalNeedPharmacist = needPharmacist || result === 'pharmacist_followup' || result === 'self_discontinued';

    const record = addCallRecord({
      taskId: task.id,
      patientId: patient.id,
      result,
      patientQuote,
      tags: selectedTags,
      needPharmacistFollowup: finalNeedPharmacist,
      pharmacistFollowupReason: finalNeedPharmacist ? (followupReason || result === 'self_discontinued' ? '患者自行停药，需药师介入' : patientQuote) : undefined,
      appointmentTime: result === 'appointment' ? appointmentTime : undefined,
      callDuration,
      operatorId: 'op-001',
      operatorName: '李静',
    });

    if (finalNeedPharmacist) {
      addPharmacistTask({
        callRecordId: record.id,
        patientId: patient.id,
        pharmacistId: patient.pharmacistId,
        storeId: patient.storeId,
        reason: followupReason || patientQuote || CALL_RESULT_LABELS[result],
        priority: result === 'self_discontinued' ? 'urgent' : followupPriority,
        status: 'pending',
        note: followupNote,
      });
    }

    updateTaskStatus(task.id, result === 'no_answer' && task.callCount < 2 ? 'pending' : 'completed');
    navigate('/call-list');
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  useEffect(() => {
    if (result === 'pharmacist_followup') setNeedPharmacist(true);
    if (result === 'self_discontinued') setNeedPharmacist(true);
  }, [result]);

  return (
    <div>
      <PageHeader
        title="回访结果登记"
        subtitle="请如实登记本次回访情况，涉及药理问题请推送药师跟进"
        back
        icon={<ClipboardList className="w-6 h-6 text-white" />}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-medical-500 to-medical-700 text-white flex items-center justify-center text-3xl font-bold shadow-xl shadow-medical-500/25">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
                    {task && <PriorityBadge priority={task.priority} />}
                  </div>
                  <div className="text-sm text-slate-500">{patient.gender} · {patient.age}岁</div>
                  <div className="flex items-center gap-4 mt-2">
                    <a href={`tel:${patient.phone}`} className="inline-flex items-center gap-1.5 text-medical-600 font-medium hover:text-medical-700 text-sm">
                      <Phone className="w-4 h-4" />
                      {patient.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-3 mb-2 justify-end">
                  <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-trust-50 to-medical-50 border border-trust-200">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-trust-600" />
                      <span className="text-2xl font-mono font-bold text-trust-700">{formatDuration(callDuration)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsTimerRunning(r => !r)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                      isTimerRunning ? 'bg-danger-500 text-white' : 'bg-trust-500 text-white'
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                </div>
                <div className="text-xs text-slate-400">{isTimerRunning ? '通话计时中' : '计时已暂停'}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-medical-500" />
                <span className="text-slate-600 truncate">{store?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope className="w-4 h-4 text-trust-500" />
                <span className="text-slate-600">{pharmacist?.name} ({pharmacist?.title})</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Pill className="w-4 h-4 text-warn-500" />
                <span className="text-slate-600 truncate">{patient.lastDrugName}</span>
              </div>
            </div>
          </div>

          <div className="card p-6 relative overflow-hidden">
            {task && <PriorityBar priority={task.priority} />}
            <div className="pl-3">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-medical-500" />
                本次话术重点
              </h3>
              <div className="bg-gradient-to-r from-medical-50 to-trust-50/60 rounded-xl p-4 border border-medical-100 mb-4">
                <p className="text-sm text-slate-700 leading-relaxed">{rule?.scriptTemplate}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {task?.keyPoints.map((kp, i) => (
                  <label key={i} className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-medical-50/50 transition-colors">
                    <input type="checkbox" className="mt-1 accent-medical-500" />
                    <span className="text-sm text-slate-700 flex-1">{kp}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-trust-500" />
              选择回访结果 <span className="text-danger-500">*</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {RESULT_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const checked = result === opt.value;
                return (
                  <label key={opt.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="callResult"
                      className="hidden peer"
                      checked={checked}
                      onChange={() => setResult(opt.value)}
                    />
                    <div className={`p-4 rounded-xl border-2 border-slate-200 transition-all peer-checked:border-2 ${opt.bgClass} hover:border-medical-300 ${checked ? 'shadow-md' : ''}`}>
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className={`w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center ${opt.color} border border-slate-100`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`font-bold ${checked ? opt.color : 'text-slate-700'}`}>{opt.label}</span>
                      </div>
                      <div className={`text-xs pl-12 ${checked ? 'text-slate-600' : 'text-slate-400'}`}>{opt.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {result === 'appointment' && (
            <div className="card p-6 border-cyan-200 bg-cyan-50/30">
              <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-600" />
                预约回访时间
              </h3>
              <input
                type="datetime-local"
                className="input-base max-w-sm"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
              />
            </div>
          )}

          <div className="card p-6">
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-medical-500" />
              患者原话记录
            </h3>
            <textarea
              className="input-base min-h-[120px] resize-none"
              placeholder="请记录患者的原话或关键信息，便于后续药师跟进时参考..."
              value={patientQuote}
              onChange={(e) => setPatientQuote(e.target.value)}
            />
            <div className="mt-4">
              <div className="text-xs text-slate-500 mb-2 font-medium">快速标签（可多选）</div>
              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-medical-500 text-white border-medical-500 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-medical-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`card p-6 ${needPharmacist ? 'border-medical-300 bg-medical-50/30' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-medical-600" />
                推送门店药师跟进
              </h3>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded accent-medical-500"
                  checked={needPharmacist}
                  onChange={(e) => setNeedPharmacist(e.target.checked)}
                />
                <span className="text-sm font-medium text-slate-700">标记为专业问题</span>
              </label>
            </div>

            {!needPharmacist ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-sm text-slate-500">
                <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                如涉及药理问题、停药风险、副作用等，请标记后自动推送对应门店药师处理，客服无需自行解答
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="p-3 rounded-xl bg-white border border-medical-200">
                  <div className="text-xs text-slate-500 mb-1">推送药师</div>
                  <div className="font-medium text-slate-800 flex items-center gap-2">
                    <User className="w-4 h-4 text-medical-500" />
                    {pharmacist?.name} · {pharmacist?.title} · {store?.name}
                  </div>
                </div>

                <div>
                  <label className="label-base">问题分类</label>
                  <div className="flex flex-wrap gap-2">
                    {FOLLOWUP_REASONS.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setFollowupReason(r === followupReason ? '' : r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          followupReason === r
                            ? 'bg-medical-500 text-white border-medical-500'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-medical-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-base">紧急程度</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['urgent', 'normal', 'low'] as const).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFollowupPriority(p as any)}
                          className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                            followupPriority === p
                              ? p === 'urgent' ? 'bg-danger-50 text-danger-700 border-danger-300'
                              : p === 'normal' ? 'bg-medical-50 text-medical-700 border-medical-300'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {p === 'urgent' ? '紧急' : p === 'normal' ? '普通' : '低'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label-base">补充说明（可选）</label>
                  <textarea
                    className="input-base min-h-[80px] resize-none"
                    placeholder="对药师的补充说明或注意事项..."
                    value={followupNote}
                    onChange={(e) => setFollowupNote(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button className="btn-secondary" onClick={() => navigate('/call-list')}>
              <ArrowLeft className="w-4 h-4" />
              返回待拨名单
            </button>
            <button className="btn-primary h-12 px-8" onClick={submit}>
              <Send className="w-5 h-5" />
              提交回访结果
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {result && (
            <div className="card p-5 sticky top-6">
              <h4 className="text-sm font-bold text-slate-800 mb-3">本次回访摘要</h4>
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-50">
                  <CallResultBadge result={result} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-slate-500 text-xs">通话时长</div>
                    <div className="font-mono font-bold text-slate-800">{formatDuration(callDuration)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-xs">标签</div>
                    <div className="font-bold text-slate-800">{selectedTags.length}个</div>
                  </div>
                </div>
                {needPharmacist && (
                  <div className="p-3 rounded-xl bg-medical-50 border border-medical-100 text-xs text-medical-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  已推送至 {pharmacist?.name} 药师
                </div>
                )}
              </div>
            </div>
          )}

          <div className="card p-5">
            <h4 className="text-sm font-bold text-slate-800 mb-4">操作提示</h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-medical-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">1</span>
                拨打前先查看话术重点，按顺序询问患者
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-medical-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">2</span>
                如实记录患者原话，不要自行概括
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-danger-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">!</span>
                药理问题<strong className="text-danger-700">严禁自行解答</strong>，一律推送药师
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-warn-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">3</span>
                发现停药倾向立即标记高优推送
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
