import React from 'react';
import { Bell, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/auth.context';
import { Badge } from '../ui/Badge';
import { getRoleBadgeLabel } from '../../utils/formatters';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: string[];
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, breadcrumbs }) => {
  const { user, role } = useAuth();
  const roleBadge = getRoleBadgeLabel(role || '');

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span>{crumb}</span>
                {idx < breadcrumbs.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search shortcut simulation */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-400">
          <Search className="h-3.5 w-3.5" />
          <span>Tìm nhanh...</span>
          <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-500 shadow-2xs">
            Ctrl+K
          </kbd>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        </button>

        <div className="h-4 w-px bg-slate-200"></div>

        {/* Current user badge */}
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <Badge variant="primary" size="md">
            {roleBadge.label}
          </Badge>
          <span className="text-xs font-semibold text-slate-800">
            {user?.profile?.fullName || user?.username}
          </span>
        </div>
      </div>
    </header>
  );
};
