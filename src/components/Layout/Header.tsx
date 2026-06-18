import { Bell, Search, ChevronDown, User, Calendar, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import { usePharmacistTaskStore } from '@/store/pharmacistTaskStore';
import { useCallTaskStore } from '@/store/callTaskStore';

function Header() {
  const pendingPharmacistTasks = usePharmacistTaskStore((s) => s.getPendingTasksCount());
  const pendingCallTasks = useCallTaskStore((s) => s.callTasks.filter(t => t.status === 'pending').length);
  const totalPending = pendingPharmacistTasks + pendingCallTasks;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/70">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">{dayjs().format('YYYY年MM月DD日 dddd')}</span>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索患者姓名、手机号、药品名..."
            className="pl-9 pr-4 py-2 w-80 text-sm rounded-lg bg-slate-100/70 border border-transparent focus:bg-white focus:border-medical-300 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-medical-50 text-medical-700 border border-medical-100">
          <Clock className="w-4 h-4" />
          <span className="text-xs font-medium">系统运行正常</span>
        </div>

        <button className="relative w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          {totalPending > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
              {totalPending > 99 ? '99+' : totalPending}
            </span>
          )}
        </button>

        <div className="w-px h-8 bg-slate-200 mx-1"></div>

        <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-lg hover:bg-slate-100 transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-medical-400 to-medical-600 flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-slate-800 leading-tight">李静</div>
            <div className="text-xs text-slate-500 leading-tight">客服主管</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </header>
  );
}

export default Header;
