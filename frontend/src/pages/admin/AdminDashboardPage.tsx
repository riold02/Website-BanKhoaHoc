import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUpRight, BarChart3, BookOpen, Calendar, Plus, TrendingUp, Users } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { courseApi } from '../../services/course.api';
import { dashboardApi } from '../../services/dashboard.api';
import { DashboardOverview } from '../../types/dashboard.types';
import { Course } from '../../types/course.types';
import { formatVND } from '../../utils/formatters';

const CHART_COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#14b8a6'];

const formatMonthLabel = (month: string) => {
  if (!month || month === 'N/A') return month;
  const [year, monthNumber] = month.split('-');
  if (!year || !monthNumber) return month;
  return `T${Number(monthNumber)}/${year.slice(2)}`;
};

export const AdminDashboardPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revenueChartType, setRevenueChartType] = useState<'area' | 'bar'>('area');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [overviewRes, courseRes] = await Promise.all([
          dashboardApi.getOverview(),
          courseApi.getCourses({ limit: 5 }),
        ]);

        setDashboard(overviewRes);
        setCourses(courseRes.courses);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalCourses = dashboard?.totals.courses ?? 0;
  const totalUsers = dashboard?.totals.users ?? 0;
  const openPeriods = dashboard?.totals.openPeriods ?? 0;
  const totalRevenue = dashboard?.totals.totalRevenue ?? 0;
  const revenueByMonth = dashboard?.revenueByMonth ?? [];
  const tuitionBreakdown = dashboard?.tuitionBreakdown ?? [];
  const courseBreakdown = dashboard?.courseBreakdown ?? [];

  const chartRevenueData = useMemo(() => {
    if (!revenueByMonth.length) {
      return [{ name: 'N/A', revenue: 0 }];
    }
    return revenueByMonth.map((item) => ({
      name: formatMonthLabel(item.month),
      revenue: Number(item.revenue || 0),
    }));
  }, [revenueByMonth]);

  const maxRevenueMonth = useMemo(() => {
    if (!revenueByMonth.length) return null;
    return revenueByMonth.reduce((prev, curr) => (curr.revenue > prev.revenue ? curr : prev), revenueByMonth[0]);
  }, [revenueByMonth]);

  const chartCourseData = useMemo(
    () =>
      courseBreakdown.length
        ? courseBreakdown.map((item) => ({
            name: item.name,
            value: Number(item.value || 0),
          }))
        : [{ name: 'Chưa có dữ liệu', value: 0 }],
    [courseBreakdown]
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Badge variant="info" size="sm" className="mb-2 bg-blue-500/20 text-blue-200 border-blue-400/30">
            Hệ Thống Sẵn Sàng (Ready)
          </Badge>
          <h2 className="text-xl font-bold tracking-tight text-white">Trung Tâm Quản Trị Khóa Học & Đào Tạo</h2>
          <p className="text-xs text-blue-100/80 mt-1 max-w-xl leading-relaxed">
            Theo dõi doanh thu, tiến độ thanh toán học phí và phân bổ khóa học theo từng chuyên ngành trong thời gian thực.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/admin/courses')} icon={<Plus className="h-4 w-4" />}>
            Thêm Khóa Học Mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng Khóa Học"
          value={totalCourses}
          icon={<BookOpen className="h-5 w-5" />}
          subtitle="Đang quản lý trong danh mục"
          colorScheme="blue"
          trend={{ value: `${dashboard?.conversionRate?.rate ?? 0}% tỷ lệ duyệt`, isPositive: true }}
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
          value={openPeriods ? `${openPeriods} Đợt` : '0 Đợt'}
          icon={<Calendar className="h-5 w-5" />}
          subtitle="Theo dõi các đợt tuyển sinh đang mở"
          colorScheme="amber"
        />

        <StatCard
          title="Doanh Thu Hệ Thống"
          value={formatVND(totalRevenue)}
          icon={<TrendingUp className="h-5 w-5" />}
          subtitle="Tổng doanh thu từ giao dịch đã ghi nhận"
          colorScheme="emerald"
          trend={{ value: `${dashboard?.totals.paidInvoices ?? 0} hóa đơn đã thu`, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Doanh Thu Theo Tháng</h3>
                {maxRevenueMonth && maxRevenueMonth.revenue > 0 && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                    Đỉnh: {formatVND(maxRevenueMonth.revenue)} ({formatMonthLabel(maxRevenueMonth.month)})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Biểu đồ xu hướng doanh thu thu học phí 6 tháng gần nhất</p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setRevenueChartType('area')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  revenueChartType === 'area'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Miền (Area)
              </button>
              <button
                type="button"
                onClick={() => setRevenueChartType('bar')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  revenueChartType === 'bar'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cột (Bar)
              </button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {revenueChartType === 'area' ? (
                <AreaChart data={chartRevenueData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    formatter={(value) => [formatVND(Number(Array.isArray(value) ? value[0] : value ?? 0)), 'Doanh thu']}
                    labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#revenueFill)"
                    dot={{ r: 4, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6, stroke: '#1d4ed8', strokeWidth: 2, fill: '#ffffff' }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartRevenueData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    formatter={(value) => [formatVND(Number(Array.isArray(value) ? value[0] : value ?? 0)), 'Doanh thu']}
                    labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}
                  />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Tình Trạng Học Phí</h3>
              <p className="text-xs text-slate-500">Phân bổ thanh toán theo hóa đơn</p>
            </div>
            <BarChart3 className="h-4 w-4 text-slate-500" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tuitionBreakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4}>
                  {tuitionBreakdown.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${Number(Array.isArray(value) ? value[0] : value ?? 0)} hóa đơn`}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {tuitionBreakdown.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Số Lượng Học Sinh Theo Từng Khóa</h3>
              <p className="text-xs text-slate-500">Số lượng học viên ghi danh trên từng khóa đào tạo</p>
            </div>
            <div className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">Students</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartCourseData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value) => `${Number(Array.isArray(value) ? value[0] : value ?? 0)} học sinh`}
                  labelStyle={{ color: '#0f172a' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartCourseData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Danh Sách Khóa Học Mới Cập Nhật</h3>
            <p className="text-xs text-slate-500">Các chương trình đào tạo tiêu biểu của trung tâm</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/courses')} icon={<ArrowUpRight className="h-3.5 w-3.5" />}>
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
                    <td className="px-6 py-3.5 font-mono font-semibold text-blue-600">{course.courseCode}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-900 max-w-xs truncate">{course.title}</td>
                    <td className="px-6 py-3.5"><span className="text-slate-600">{course.category?.name || 'Chung'}</span></td>
                    <td className="px-6 py-3.5 font-mono">{course.totalHours} tiết</td>
                    <td className="px-6 py-3.5 font-mono font-semibold text-slate-900">{formatVND(course.standardPrice)}</td>
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
