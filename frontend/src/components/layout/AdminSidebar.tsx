import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarDays,
  GraduationCap,
  Receipt,
  LogOut,
  ExternalLink,
  GraduationCap as LogoIcon,
} from "lucide-react";
import { useAuth } from "../../context/auth.context";
import { Badge } from "../ui/Badge";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  exact?: boolean;
  badge?: string;
  isComingSoon?: boolean;
}

export const AdminSidebar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      label: "Tổng quan (Dashboard)",
      path: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
      exact: true,
    },
    {
      label: "Quản lý Khóa học",
      path: "/admin/courses",
      icon: <BookOpen className="h-4 w-4" />,
    },
    ...(role === "ADMIN"
      ? [
          {
            label: "Quản lý Tài khoản",
            path: "/admin/users",
            icon: <Users className="h-4 w-4" />,
          },
        ]
      : []),
    {
      label: "Đợt Tuyển sinh",
      path: "/admin/enrollment-periods",
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      label: "Xét duyệt Đơn ĐK",
      path: "/admin/registrations",
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      label: "Quản lý Học viên",
      path: "/admin/students",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Lớp học & Điểm danh",
      path: "/admin/classes",
      icon: <Receipt className="h-4 w-4" />,
    },
    {
      label: "Sổ Học phí & Công nợ",
      path: "/admin/tuition",
      icon: <Receipt className="h-4 w-4" />,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen select-none">
      {/* Brand Logo */}
      <div className="p-5 border-b border-slate-200 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
          <LogoIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
            TRUNG TÂM ĐÀO TẠO
          </h1>
          <p className="text-[11px] font-medium text-slate-500">
            Đại Học Đà Lạt (DLU)
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Phân Hệ Quản Trị
        </div>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.isComingSoon ? "#" : item.path}
            end={item.exact}
            onClick={(e) => {
              if (item.isComingSoon) {
                e.preventDefault();
                alert(
                  `Tính năng '${item.label}' do Thành viên khác trong nhóm phụ trách theo System Design.`,
                );
              }
            }}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive && !item.isComingSoon
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              } ${item.isComingSoon ? "opacity-65" : ""}`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <Badge
                variant={item.isComingSoon ? "slate" : "primary"}
                size="sm"
                className="text-[10px] py-0 px-1.5"
              >
                {item.badge}
              </Badge>
            )}
          </NavLink>
        ))}

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Liên kết ngoài
        </div>

        <button
          onClick={() => navigate("/courses")}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="h-4 w-4 text-slate-400" />
            <span>Cổng Xem Khóa Học</span>
          </div>
          <span className="text-[10px] text-slate-400">Student</span>
        </button>
      </div>

      {/* User info footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
              {user?.profile?.fullName ? user.profile.fullName.charAt(0) : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user?.profile?.fullName || user?.username}
              </p>
              <p className="text-[10px] font-medium text-blue-600 truncate">
                {user?.role?.name}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Đăng xuất"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
