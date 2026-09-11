import React from 'react';
import { Outlet } from 'react-router-dom';
import { StudentNavbar } from '../components/layout/StudentNavbar';
import { GraduationCap, Mail, MapPin, Phone } from 'lucide-react';

export const StudentLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <StudentNavbar />
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-600 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-slate-900 text-sm">
                TRUNG TÂM ĐÀO TẠO ĐH ĐÀ LẠT
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Đào tạo ngắn hạn thực chiến, bồi dưỡng kỹ năng tin học, lập trình và ngoại ngữ theo chuẩn doanh nghiệp và chứng chỉ quốc tế.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Thông Tin Liên Hệ Tuyển Sinh
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Số 01 Phù Đổng Thiên Vương, Phường 8, TP. Đà Lạt, Lâm Đồng</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Hotline: (0263) 3822 246 - (0263) 3822 093</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span>Email: phongdaotao@dlu.edu.vn</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Chất Lượng & Uy Tín Đào Tạo
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống Quản lý Đào tạo & Tuyển sinh Trực tuyến Trường Đại Học Đà Lạt. Đảm bảo quy trình đăng ký minh bạch, tài liệu học tập cập nhật và chứng chỉ có giá trị toàn quốc.
            </p>
            <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold text-blue-600">
              <a href="/about" className="hover:underline">Về Trung Tâm</a>
              <span>·</span>
              <a href="/admissions" className="hover:underline">Hỗ Trợ Tuyển Sinh</a>
              <span>·</span>
              <a href="/courses" className="hover:underline">Khóa Học Mới</a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <span>© 2026 Trung Tâm Đào Tạo - Trường Đại Học Đà Lạt (DLU). Bảo lưu mọi quyền.</span>
          <span className="mt-2 sm:mt-0 font-mono">Phiên bản Release 1.0.0 (MVP)</span>
        </div>
      </footer>
    </div>
  );
};
