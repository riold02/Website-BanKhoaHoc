import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Calendar, TrendingUp, Plus, ArrowUpRight, GraduationCap } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { courseApi } from '../../services/course.api';
import { authApi } from '../../services/auth.api';
import { Course } from '../../types/course.types';
import { formatVND } from '../../utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [courseRes, userRes] = await Promise.all([
          courseApi.getCourses({ limit: 5 }),
          authApi.listUsers({ limit: 1 }),
        ]);
        setCourses(courseRes.courses);
        setTotalCourses(courseRes.meta?.total || 0);
        setTotalUsers(userRes.meta?.total || 0);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Badge variant="info" size="sm" className="mb-2 bg-blue-500/20 text-blue-200 border-blue-400/30">
            Hệ Thống Sẵn Sàng (Ready)
          </Badge>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Trung Tâm Quản Trị Khóa Học & Đào Tạo
          </h2>
          <p className="text-xs text-blue-100/80 mt-1 max-w-xl leading-relaxed">
            Chào mừng bạn đến với bảng điều khiển trung tâm. Theo dõi tình trạng các khóa học, quản lý danh mục và phân bổ nguồn lực đào tạo theo thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/courses')}
            icon={<Plus className="h-4 w-4" />}
          >
            Thêm Khóa Học Mới
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng Khóa Học"
          value={totalCourses}
          icon={<BookOpen className="h-5 w-5" />}
          subtitle="Đang quản lý trong danh mục"
          colorScheme="blue"
          trend={{ value: '+2 khóa mới', isPositive: true }}
        />

        <StatCard
          title="Tài Khoản Hệ Thống"
          value={totalUsers}
          icon={<Users className="h-5 w-5" />}
          subtitle="Admin, Giáo vụ & Học viên"
          colorScheme="purple"
          trend={{ value: 'Hoạt động 100%', isPositive: true }}
        />

        <StatCard
          title="Đợt Đang Mở Đăng Ký"
          value="1 Đợt"
          icon={<Calendar className="h-5 w-5" />}
          subtitle="Khóa K15 - Tháng 10/2026"
          colorScheme="amber"
        />

        <StatCard
          title="Doanh Thu Đăng Ký Dự Kiến"
          value={formatVND(3500000 * 18)}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle="Từ 18 hồ sơ đợt K15"
          colorScheme="emerald"
          trend={{ value: '72% chỉ tiêu', isPositive: true }}
        />
      </div>

      {/* Recent Courses Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Danh Sách Khóa Học Mới Cập Nhật</h3>
            <p className="text-xs text-slate-500">Các chương trình đào tạo tiêu biểu của trung tâm</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/courses')}
            icon={<ArrowUpRight className="h-3.5 w-3.5" />}
          >
            Xem Tất Cả
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Mã Khóa</th>
                <th className="px-6 py-3 font-semibold">Tên Khóa Học</th>
                <th className="px-6 py-3 font-semibold">Danh Mục</th>
                <th className="px-6 py-3 font-semibold">Thời Lượng</th>
                <th className="px-6 py-3 font-semibold">Học Phí Định Mức</th>
                <th className="px-6 py-3 font-semibold">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Đang tải dữ liệu khóa học...
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Chưa có khóa học nào.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3.5 font-mono font-semibold text-blue-600">
                      {course.courseCode}
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-900 max-w-xs truncate">
                      {course.title}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-slate-600">{course.category?.name || 'Chung'}</span>
                    </td>
                    <td className="px-6 py-3.5 font-mono">{course.totalHours} tiết</td>
                    <td className="px-6 py-3.5 font-mono font-semibold text-slate-900">
                      {formatVND(course.standardPrice)}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant={course.isActive ? 'success' : 'slate'} size="sm">
                        {course.isActive ? 'Đang mở' : 'Ngưng'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
