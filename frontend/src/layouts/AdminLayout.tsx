import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminHeader } from '../components/layout/AdminHeader';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/admin':
        return {
          title: 'Bảng Điều Khiển Trung Tâm',
          subtitle: 'Tổng quan chỉ số đào tạo, khóa học và hoạt động tuyển sinh',
          breadcrumbs: ['Quản Trị', 'Dashboard'],
        };
      case '/admin/courses':
        return {
          title: 'Quản Lý Khóa Học',
          subtitle: 'Thiết lập danh mục, đề cương, thời lượng và học phí định mức',
          breadcrumbs: ['Quản Trị', 'Khóa Học'],
        };
      case '/admin/users':
        return {
          title: 'Quản Lý Tài Khoản & Phân Quyền',
          subtitle: 'Quản lý tài khoản Admin, Giáo vụ đào tạo và Học viên',
          breadcrumbs: ['Quản Trị', 'Tài Khoản'],
        };
      default:
        return {
          title: 'Phân Hệ Quản Trị',
          subtitle: 'Hệ thống Quản lý Khóa học & Học viên - ĐH Đà Lạt',
          breadcrumbs: ['Quản Trị'],
        };
    }
  };

  const info = getPageInfo();

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader title={info.title} subtitle={info.subtitle} breadcrumbs={info.breadcrumbs} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
