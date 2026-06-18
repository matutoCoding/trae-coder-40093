import { useState } from 'react';
import { FileText, Plus, Pencil, Trash2, Search, X, Check, ChevronDown, GripVertical, Sparkles } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useRulesStore } from '@/store/rulesStore';
import { PriorityBadge, RuleEnabledBadge, SwitchToggle } from '@/components/Badges';
import type { Rule, DrugCategory, TriggerType, Priority } from '@/types';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const DRUG_CATEGORIES: DrugCategory[] = [
  '抗肿瘤靶向药', '自身免疫抑制剂', '冷链生物制剂', '抗病毒药物', '心血管慢病药', '糖尿病用药', '罕见病特效药',
];

const TRIGGER_TYPES: { value: TriggerType; label: string; desc: string }[] = [
  { value: 'days_after_purchase', label: '购药后天数', desc: '距离上次购药后第N天触发' },
  { value: 'day_after_arrival', label: '到货后天数', desc: '药品到货后第N天触发' },
  { value: 'days_after_first_purchase', label: '首次购药后天数', desc: '患者首次购买该类药品后第N天触发' },
];

interface RuleFormProps {
  initial?: Rule;
  onSave: (data: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

function RuleForm({ initial, onSave, onClose }: RuleFormProps) {
  const [name, setName] = useState(initial?.name || '');
  const [drugCategories, setDrugCategories] = useState<DrugCategory[]>(initial?.drugCategories || []);
  const [triggerType, setTriggerType] = useState<TriggerType>(initial?.triggerType || 'days_after_purchase');
  const [triggerValue, setTriggerValue] = useState(initial?.triggerValue || 25);
  const [priority, setPriority] = useState<Priority>(initial?.priority || 'medium');
  const [scriptTemplate, setScriptTemplate] = useState(initial?.scriptTemplate || '');
  const [keyPointsInput, setKeyPointsInput] = useState((initial?.keyPoints || []).join('\n'));
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);

  const toggleCategory = (cat: DrugCategory) => {
    setDrugCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = () => {
    const keyPoints = keyPointsInput.split('\n').map((s) => s.trim()).filter(Boolean);
    onSave({
      name,
      drugCategories,
      triggerType,
      triggerValue,
      priority,
      scriptTemplate,
      keyPoints,
      enabled,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-medical-500" />
          {initial ? '编辑回访规则' : '创建回访规则'}
        </h3>
        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
        <div>
          <label className="label-base">规则名称</label>
          <input
            className="input-base"
            placeholder="如：疗程第25天剩余药量询问"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="label-base">适用药品类别</label>
          <div className="flex flex-wrap gap-2">
            {DRUG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  drugCategories.includes(cat)
                    ? 'bg-medical-500 text-white border-medical-500 shadow-sm shadow-medical-500/25'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-medical-300 hover:text-medical-600'
                }`}
              >
                {drugCategories.includes(cat) && <Check className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-base">触发方式</label>
            <div className="space-y-2">
              {TRIGGER_TYPES.map((t) => (
                <label
                  key={t.value}
                >
                  <input
                  type="radio"
                  name="triggerType"
                  checked={triggerType === t.value}
                  onChange={() => setTriggerType(t.value)}
                  className="hidden peer"
                />
                <div className={`p-3 rounded-lg border cursor-pointer transition-all peer-checked:border-medical-500 peer-checked:bg-medical-50/50 ${
                  triggerType === t.value ? 'border-medical-500 bg-medical-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      triggerType === t.value ? 'border-medical-500' : 'border-slate-300'
                    }`}>
                      {triggerType === t.value && <span className="w-2 h-2 rounded-full bg-medical-500"></span>}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{t.label}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 ml-6">{t.desc}</div>
                </div>
              </label>
            ))}
            </div>
          </div>
          <div>
            <label className="label-base">触发天数：第 <span className="text-medical-600 font-bold">{triggerValue}</span> 天</label>
            <input
              type="range"
              min={1}
              max={90}
              value={triggerValue}
              onChange={(e) => setTriggerValue(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-medical-500 mt-2"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>1天</span>
              <span>30天</span>
              <span>60天</span>
              <span>90天</span>
            </div>
            <div className="mt-4">
              <label className="label-base">优先级</label>
              <div className="grid grid-cols-3 gap-2">
                {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                      priority === p
                        ? p === 'high' ? 'bg-danger-50 text-danger-700 border-danger-300'
                        : p === 'medium' ? 'bg-warn-50 text-warn-700 border-warn-300'
                        : 'bg-trust-50 text-trust-700 border-trust-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="label-base">话术模板（可替换[患者姓名]、[药品名称]）</label>
          <textarea
            className="input-base min-h-[100px] resize-none"
            placeholder="您好，这里是XX药房客服中心..."
            value={scriptTemplate}
            onChange={(e) => setScriptTemplate(e.target.value)}
          />
        </div>

        <div>
          <label className="label-base">话术重点（每行一条，回访时展示给客服）</label>
          <textarea
            className="input-base min-h-[100px] resize-none font-mono text-sm"
            placeholder="确认剩余药量&#10;询问是否有漏服情况&#10;提醒按时按量服药"
            value={keyPointsInput}
            onChange={(e) => setKeyPointsInput(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="text-sm font-medium text-slate-700">启用该规则</div>
            <div className="text-xs text-slate-500">关闭后系统将不再根据此规则生成回访任务</div>
          </div>
          <SwitchToggle checked={enabled} onChange={setEnabled} />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
        <button className="btn-secondary" onClick={onClose}>取消</button>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!name || drugCategories.length === 0}
        >
          保存规则
        </button>
      </div>
    </div>
    </div>
  );
}

function Rules() {
  const navigate = useNavigate();
  const { rules, addRule, updateRule, deleteRule, toggleRule } = useRulesStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DrugCategory | 'all'>('all');

  const filtered = rules.filter((r) => {
    const matchSearch = !search || r.name.includes(search);
    const matchCat = categoryFilter === 'all' || r.drugCategories.includes(categoryFilter);
    return matchSearch && matchCat;
  });

  const handleSave = (data: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing) {
      updateRule(editing.id, data);
    } else {
      addRule(data);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('确认删除该规则吗？删除后不可恢复')) {
      deleteRule(id);
    }
  };

  return (
    <div>
      <PageHeader
        title="回访规则配置"
        subtitle="按药品类别设置回访触发条件与话术模板"
        icon={<FileText className="w-6 h-6 text-white" />}
        actions={
          <button
            className="btn-primary"
            onClick={() => { setEditing(null); setShowForm(true); }}
          >
            <Plus className="w-4 h-4" />
            新建规则
          </button>
        }
        stats={[
          { label: '规则总数', value: rules.length, color: 'text-medical-600' },
          { label: '已启用', value: rules.filter(r => r.enabled).length, color: 'text-trust-600' },
          { label: '今日生成任务', value: '60', color: 'text-warn-600' },
          { label: '覆盖药品种类', value: DRUG_CATEGORIES.length, color: 'text-slate-600' },
        ]}
      />

      <div className="card p-4 mb-5 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-base pl-9"
            placeholder="搜索规则名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">药品类别:</span>
          <div className="relative">
            <select
              className="input-base pr-9 appearance-none cursor-pointer"
              value={categoryFilter}
              onChange={(e) => {
                const v = e.target.value;
                setCategoryFilter(v as any);
              }}
            >
              <option value="all">全部类别</option>
              {DRUG_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((rule) => (
          <div key={rule.id} className="card-hover p-5 relative overflow-hidden">
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${
            rule.priority === 'high' ? 'bg-danger-500' : rule.priority === 'medium' ? 'bg-warn-500' : 'bg-trust-500'
          }`}></div>

          <div className="flex items-start justify-between gap-4 pl-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-800">{rule.name}</h3>
                <PriorityBadge priority={rule.priority} />
                <RuleEnabledBadge enabled={rule.enabled} />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {rule.drugCategories.map((cat) => (
                  <span key={cat} className="tag bg-medical-50 text-medical-700 border-medical-100">
                    {cat}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="text-sm">
                  <span className="text-slate-500">触发方式：</span>
                  <span className="text-slate-700 font-medium">
                    {TRIGGER_TYPES.find(t => t.value === rule.triggerType)?.label}
                    {' '}第{rule.triggerValue}天
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">更新时间：</span>
                  <span className="text-slate-700">{dayjs(rule.updatedAt).format('MM-DD HH:mm')}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">话术重点：</span>
                  <span className="text-slate-700 font-medium">{rule.keyPoints.length} 条</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-medical-50/30 border border-slate-100">
                <div className="text-xs text-slate-500 mb-1.5 font-medium flex items-center gap-1.5">
                  <GripVertical className="w-3.5 h-3.5" />
                  话术模板预览
                </div>
                <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">{rule.scriptTemplate}</p>
                {rule.keyPoints.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60">
                    <div className="text-xs text-slate-500 mb-1.5">话术重点</div>
                    <ul className="space-y-1">
                      {rule.keyPoints.slice(0, 3).map((kp, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-medical-100 text-medical-600 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">{i + 1}</span>
                          {kp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <SwitchToggle checked={rule.enabled} onChange={() => toggleRule(rule.id)} />
              <button
                className="w-9 h-9 rounded-lg hover:bg-medical-50 flex items-center justify-center text-medical-600 transition-colors"
                onClick={() => { setEditing(rule); setShowForm(true); }}
                title="编辑"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                className="w-9 h-9 rounded-lg hover:bg-danger-50 flex items-center justify-center text-danger-500 transition-colors"
                onClick={() => handleDelete(rule.id)}
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
        {filtered.length === 0 && (
          <div className="card p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <div className="text-slate-500 mb-2">没有找到匹配的规则</div>
            <button className="btn-primary mt-2" onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="w-4 h-4" /> 创建第一条规则
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <RuleForm
          initial={editing || undefined}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
      {/* 避免未使用变量警告 */}
      <span className="hidden">{navigate && ''}</span>
    </div>
  );
}

export default Rules;
