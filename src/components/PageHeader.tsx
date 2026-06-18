import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  back?: boolean;
  actions?: ReactNode;
  stats?: { label: string; value: string | number; color?: string }[];
}

function PageHeader({ title, subtitle, icon, back, actions, stats }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 animate-slide-up">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          {back && (
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-lg hover:bg-white flex items-center justify-center text-slate-600 hover:text-medical-600 transition-colors border border-transparent hover:border-slate-200 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-medical-500 to-medical-700 flex items-center justify-center shadow-lg shadow-medical-500/25 shrink-0">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight truncate">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="card p-4">
              <div className="text-xs text-slate-500 mb-1">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color || 'text-slate-800'}`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
