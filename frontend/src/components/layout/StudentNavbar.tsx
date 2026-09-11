import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
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

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/courses" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
              CMS ĐÀO TẠO DLU
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              Cổng Đăng Ký Khóa Học Trực Tuyến
            </span>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/courses"
            className="text-sm font-semibold text-blue-600 flex items-center gap-1.5 hover:text-blue-700 transition"
          >
            <BookOpen className="h-4 w-4" />
            <span>Danh mục Khóa học</span>
          </Link>
          {user && (
            <Link
              to="/my-tuition"
              className="text-sm font-medium text-slate-700 flex items-center gap-1.5 hover:text-slate-900 transition"
            >
              <WalletCards className="h-4 w-4" />
              <span>Học phí của tôi</span>
            </Link>
          )}
          <Link
            to="/my-registrations"
            className="text-sm font-medium text-slate-700 flex items-center gap-1.5 hover:text-slate-900 transition"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Đơn của tôi</span>
          </Link>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              alert(
                "Thông tin giới thiệu trung tâm đào tạo ngắn hạn ĐH Đà Lạt.",
              );
            }}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Về Trung Tâm
          </a>
          <a
            href="#faq"
            onClick={(e) => {
              e.preventDefault();
              alert(
                "Hotline tư vấn tuyển sinh: 0263.3822.246 - Email: daotao@dlu.edu.vn",
              );
            }}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Hỗ Trợ Tuyển Sinh
          </a>
        </nav>

        {/* Right Auth Area */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {role === "STUDENT" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/my-learning")}
                  icon={<CalendarDays className="h-4 w-4 text-blue-600" />}
                >
                  Cổng học tập
                </Button>
              )}
              {(role === "ADMIN" || role === "STAFF") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin")}
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
