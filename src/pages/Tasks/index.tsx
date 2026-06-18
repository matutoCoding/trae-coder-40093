import { useState } from 'react';
import {
  ListTodo, PhoneIncoming, Pill, AlertTriangle, CheckCircle2,
  Clock, Calendar, Filter, Search, ChevronDown, ArrowRight,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useCallTaskStore } from '@/store/callTaskStore';
import { usePharmacistTaskStore } from '@/store/pharmacistTaskStore';
import { useCallRecordStore } from '@/store/callRecordStore';
import { patients } from '@/data/patients';
import { pharmacists as allPharmacists } from '@/data/pharmacists';
import { stores } from '@/data/stores';
import { PriorityBadge, TaskStatusBadge, PharmacistStatusBadge, CallResultBadge } from '@/components/Badges';
import { useNavigate } from 'react-router-dom';
import { fromNow, dayjs } from '@/utils/date';

type TabType = 'my-calls' | 'pharmacist-tasks' | 'recent-records';

function Tasks() {
  const navigate = useNavigate();
  const { callTasks, getPendingTasksSorted } = useCallTaskStore();
  const { pharmacistTasks } = usePharmacistTaskStore();
  const { callRecords } = useCallRecordStore();
  const [tab, setTab] = useState<TabType>('my-calls');
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('all');

  const pendingTasks = getPendingTasksSorted();
  const myPharmacistTasks = pharmacistTasks.filter(t => t.status !== 'completed').slice().sort((a, b) => {
    const priorityOrder: any = { urgent: 0, normal: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  const recentRecords = callRecords.slice().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const tabs = [
    { key: 'my-calls', label: '我的回拨任务', count: pendingTasks.length, icon: PhoneIncoming, color: 'text-medical-600' },
    { key: 'pharmacist-tasks', label: '待药师跟进', count: myPharmacistTasks.length, icon: Pill, color: 'text-trust-600' },
    { key: 'recent-records', label: '近期回访记录', count: recentRecords.length, icon: CheckCircle2, color: 'text-warn-600' },
  ];

  return (
    <div>
      <PageHeader
        title="任务中心"
        subtitle="统一管理回访任务、药师跟进及历史记录"
        icon={<ListTodo className="w-6 h-6 text-white" />}
        stats={[
          { label: '待拨打', value: callTasks.filter(t => t.status === 'pending').length, color: 'text-warn-600' },
          { label: '药师待处理', value: pharmacistTasks.filter(t => t.status === 'pending').length, color: 'text-medical-600' },
          { label: '今日完成', value: callTasks.filter(t => t.status === 'completed').length, color: 'text-trust-600' },
          { label: '累计回访', value: callRecords.length, color: 'text-slate-600' },
        ]}
      />

      <div className="card mb-5 overflow-hidden">
        <div className="flex border-b border-slate-100 px-2">
          {tabs.map(t => {
            const active = tab === t.key;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as TabType)}
                className={`relative px-5 py-4 text-sm font-medium flex items-center gap-2 transition-colors ${
                  active ? 'text-medical-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? t.color : ''}`} />
                {t.label}
                {t.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    active ? 'bg-medical-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.count}
                  </span>
                )}
                {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-medical-500 rounded-t"></span>}
              </button>
            );
          })}
        </div>

        <div className="p-4 flex flex-wrap items-center gap-4 border-b border-slate-100">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-base pl-9"
              placeholder="搜索患者姓名、手机号..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <div className="relative">
              <select
                className="input-base pr-9 appearance-none cursor-pointer text-sm py-1.5 min-w-[140px]"
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
              >
                <option value="all">全部门店</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {tab === 'my-calls' && (
            pendingTasks.filter(t => {
              const patient = patients.find(p => p.id === t.patientId);
              if (!patient) return false;
              const matchSearch = !search || patient.name.includes(search) || patient.phone.includes(search);
              const matchStore = storeFilter === 'all' || t.storeId === storeFilter;
              return matchSearch && matchStore;
            }).length === 0 ? (
              <div className="p-16 text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto text-trust-400 mb-3" />
                <p className="text-slate-500">所有待回访任务已处理完成 🎉</p>
              </div>
            ) : (
              pendingTasks.filter(t => {
                const patient = patients.find(p => p.id === t.patientId);
                if (!patient) return false;
                const matchSearch = !search || patient.name.includes(search) || patient.phone.includes(search);
                const matchStore = storeFilter === 'all' || t.storeId === storeFilter;
                return matchSearch && matchStore;
              }).map(task => {
                const patient = patients.find(p => p.id === task.patientId);
                const store = stores.find(s => s.id === task.storeId);
                const pharmacist = allPharmacists.find(p => p.id === task.pharmacistId);
                if (!patient) return null;
                return (
                  <div key={task.id} className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${
                        patient.gender === '男'
                          ? 'bg-gradient-to-br from-medical-400 to-medical-600'
                          : 'bg-gradient-to-br from-pink-400 to-pink-600'
                      }`}>
                        {patient.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-slate-800">{patient.name}</span>
                          <PriorityBadge priority={task.priority} />
                          <TaskStatusBadge status={task.status} />
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                          <span>{patient.gender}{patient.age}岁 · {patient.phone}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {store?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {pharmacist?.name}药师
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/register/${task.id}`)}
                      className="btn-primary !py-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      开始回访
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )
          )}

          {tab === 'pharmacist-tasks' && (
            myPharmacistTasks.filter(t => {
              const patient = patients.find(p => p.id === t.patientId);
              if (!patient) return false;
              const matchSearch = !search || patient.name.includes(search);
              const matchStore = storeFilter === 'all' || t.storeId === storeFilter;
              return matchSearch && matchStore;
            }).length === 0 ? (
              <div className="p-16 text-center">
                <Pill className="w-16 h-16 mx-auto text-trust-400 mb-3" />
                <p className="text-slate-500">暂无待药师跟进的专业问题</p>
              </div>
            ) : (
              myPharmacistTasks.filter(t => {
                const patient = patients.find(p => p.id === t.patientId);
                if (!patient) return false;
                const matchSearch = !search || patient.name.includes(search);
                const matchStore = storeFilter === 'all' || t.storeId === storeFilter;
                return matchSearch && matchStore;
              }).map(task => {
                const patient = patients.find(p => p.id === task.patientId);
                const pharmacist = allPharmacists.find(p => p.id === task.pharmacistId);
                if (!patient) return null;
                return (
                  <div
                    key={task.id}
                    className="px-5 py-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => navigate('/pharmacist')}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0 bg-gradient-to-br from-warn-400 to-warn-600`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-slate-800">{patient.name}</span>
                            <PharmacistStatusBadge status={task.status} />
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-1 mb-1">{task.reason}</p>
                          <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                            <span>推送至：{pharmacist?.name}药师</span>
                            <span>{fromNow(task.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <button className="btn-secondary" onClick={(e) => { e.stopPropagation(); navigate('/pharmacist'); }}>
                        前往处理
                      </button>
                    </div>
                  </div>
                );
              })
            )
          )}

          {tab === 'recent-records' && (
            recentRecords.filter(r => {
              const patient = patients.find(p => p.id === r.patientId);
              if (!patient) return false;
              const matchSearch = !search || patient.name.includes(search);
              return matchSearch;
            }).map(record => {
              const patient = patients.find(p => p.id === record.patientId);
              if (!patient) return null;
              return (
                <div key={record.id} className="px-5 py-4 border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${
                        patient.gender === '男'
                          ? 'bg-gradient-to-br from-trust-400 to-trust-600'
                          : 'bg-gradient-to-br from-cyan-400 to-cyan-600'
                      }`}>
                        {patient.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-slate-800">{patient.name}</span>
                          <CallResultBadge result={record.result} />
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-1.5">
                          {record.patientQuote || '（未记录患者原话）'}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {record.tags.map(t => (
                            <span key={t} className="tag text-[10px] py-0">{t}</span>
                          ))}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                          <span>客服：{record.operatorName}</span>
                          <span>时长：{record.callDuration}秒</span>
                          <span>{dayjs(record.createdAt).format('MM-DD HH:mm')}</span>
                          {record.needPharmacistFollowup && (
                            <span className="text-medical-600 font-medium flex items-center gap-1">
                              <Pill className="w-3 h-3" />已推送药师
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Tasks;
