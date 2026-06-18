import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  PhoneCall,
  ClipboardList,
  FileText,
  Pill,
} from 'lucide-react';

const menuItems = [
  { to: '/', icon: LayoutDashboard, label: '数据看板', desc: '总部运营总览' },
  { to: '/rules', icon: FileText, label: '回访规则', desc: '配置回访触发条件' },
  { to: '/call-list', icon: PhoneCall, label: '待拨名单', desc: '今日回访任务' },
  { to: '/register', icon: ClipboardList, label: '结果登记', desc: '回访结果录入' },
  { to: '/pharmacist', icon: Pill, label: '药师工作台', desc: '专业问题跟进' },
  { to: '/tasks', icon: ListTodo, label: '任务中心', desc: '待办事项管理' },
];

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-500 to-medical-700 flex items-center justify-center shadow-lg shadow-medical-500/25">
          <Pill className="w-5 h-5 text-white" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-bold text-slate-800">DTP 回访中心</div>
          <div className="text-xs text-slate-400">会员关怀服务系统</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-item group ${
                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.label}</div>
                  <div
                    className={`text-[11px] font-normal truncate ${
                      isActive ? 'text-medical-100' : 'text-slate-400'
                    }`}
                  >
                    {item.desc}
                  </div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-medical-50 to-trust-50 rounded-xl p-4 border border-medical-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-trust-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-600">服务状态</span>
          </div>
          <div className="text-lg font-bold text-medical-700 mb-1">在线</div>
          <div className="text-xs text-slate-500">今日待回访 <span className="font-semibold text-warn-600">60</span> 人</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
