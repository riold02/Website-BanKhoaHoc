import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Info,
  LifeBuoy,
  LogIn,
  LogOut,
  ShieldCheck,
  User,
  WalletCards,
} from 'lucide-react';
import { useAuth } from '../../context/auth.context';
import { Button } from '../ui/Button';

export const StudentNavbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (target: string) => path.startsWith(target);

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/courses" className="flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="hidden min-[480px]:block">
            <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
              CMS ĐÀO TẠO DLU
            </span>
            <span className="text-[11px] font-medium text-slate-500 block whitespace-nowrap">
              Cổng Đăng Ký Khóa Học Trực Tuyến
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          <Link
            to="/courses"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition ${
              isActive('/courses')
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Khóa học</span>
          </Link>
          {user && (
            <Link
              to="/my-tuition"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition ${
                isActive('/my-tuition')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <WalletCards className="h-4 w-4" />
              <span>Học phí</span>
            </Link>
          )}
          {user && (
            <Link
              to="/my-registrations"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition ${
                isActive('/my-registrations')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Đơn của tôi</span>
            </Link>
          )}
          <Link
            to="/about"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition ${
              isActive('/about')
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Info className="h-4 w-4" />
            <span>Về Trung Tâm</span>
          </Link>
          <Link
            to="/admissions"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition ${
              isActive('/admissions')
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LifeBuoy className="h-4 w-4" />
            <span>Hỗ Trợ Tuyển Sinh</span>
          </Link>
        </nav>

        {/* Right Auth Area */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              {role === 'STUDENT' && (
                <Button
                  variant={isActive('/my-learning') ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => navigate('/my-learning')}
                  icon={<CalendarDays className="h-4 w-4" />}
                >
                  Cổng học tập
                </Button>
              )}
              {(role === 'ADMIN' || role === 'STAFF') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  icon={<ShieldCheck className="h-4 w-4 text-blue-600" />}
                >
                  Vào Trang Quản Trị
                </Button>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  {user.profile?.fullName ? (
                    user.profile.fullName.charAt(0)
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.profile?.fullName || user.username}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {user.student?.studentCode || user.role.name}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Đăng xuất"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-1"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                icon={<LogIn className="h-4 w-4" />}
              >
                Đăng Nhập
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/register")}
              >
                Đăng Ký Học Viên
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
