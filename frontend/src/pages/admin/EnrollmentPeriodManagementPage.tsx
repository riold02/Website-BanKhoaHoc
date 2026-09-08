import React, { useEffect, useState, useCallback } from 'react';
import {
  CalendarDays, Plus, Search, RefreshCw, ChevronLeft, ChevronRight,
  Users, Clock, Edit3, ToggleLeft, ToggleRight, X, AlertCircle,
} from 'lucide-react';
import { enrollmentPeriodApi } from '../../services/enrollment-period.api';
import { courseApi } from '../../services/course.api';
import { EnrollmentPeriod } from '../../types/enrollment.types';
import { Course } from '../../types/course.types';
import { formatVND, formatDate } from '../../utils/formatters';

type PeriodStatus = 'UPCOMING' | 'OPEN' | 'CLOSED' | 'CANCELLED';

const STATUS_MAP: Record<PeriodStatus, { label: string; cls: string }> = {
  UPCOMING: { label: 'Sắp mở', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  OPEN: { label: 'Đang mở', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CLOSED: { label: 'Đã đóng', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-rose-50 text-rose-600 border-rose-200' },
};

const EMPTY_FORM = {
  courseId: '',
  periodCode: '',
  name: '',
  startRegistration: '',
  endRegistration: '',
  expectedStartDate: '',
  tuitionFee: 0,
  maxCapacity: 30,
};

export const EnrollmentPeriodManagementPage: React.FC = () => {
  const [periods, setPeriods] = useState<EnrollmentPeriod[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<EnrollmentPeriod | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadPeriods = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await enrollmentPeriodApi.getPeriods({
        status: filterStatus || undefined,
        page,
        limit: 10,
      });
      setPeriods(result.periods);
      setMeta({ page: result.meta?.page || 1, totalPages: result.meta?.totalPages || 1, total: result.meta?.total || 0 });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, page]);

  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  useEffect(() => {
    courseApi.getCourses({ isActive: true, limit: 100 }).then((r) => setCourses(r.courses));
  }, []);

  const openCreate = () => {
    setEditingPeriod(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setIsDrawerOpen(true);
  };

  const openEdit = (p: EnrollmentPeriod) => {
    setEditingPeriod(p);
    setForm({
      courseId: p.courseId,
      periodCode: p.periodCode,
      name: p.name,
      startRegistration: p.startRegistration ? p.startRegistration.slice(0, 16) : '',
      endRegistration: p.endRegistration ? p.endRegistration.slice(0, 16) : '',
      expectedStartDate: p.expectedStartDate ? p.expectedStartDate.slice(0, 16) : '',
      tuitionFee: p.tuitionFee,
      maxCapacity: p.maxCapacity,
    });
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.courseId || !form.periodCode || !form.name || !form.startRegistration || !form.endRegistration) {
      setFormError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }
    setIsSaving(true);
    setFormError('');
    try {
      if (editingPeriod) {
        await enrollmentPeriodApi.updatePeriod(editingPeriod.id, {
          name: form.name,
          startRegistration: new Date(form.startRegistration).toISOString(),
          endRegistration: new Date(form.endRegistration).toISOString(),
          expectedStartDate: form.expectedStartDate ? new Date(form.expectedStartDate).toISOString() : null,
          tuitionFee: Number(form.tuitionFee),
          maxCapacity: Number(form.maxCapacity),
        });
      } else {
        await enrollmentPeriodApi.createPeriod({
          courseId: form.courseId,
          periodCode: form.periodCode,
          name: form.name,
          startRegistration: new Date(form.startRegistration).toISOString(),
          endRegistration: new Date(form.endRegistration).toISOString(),
          expectedStartDate: form.expectedStartDate ? new Date(form.expectedStartDate).toISOString() : null,
          tuitionFee: Number(form.tuitionFee),
          maxCapacity: Number(form.maxCapacity),
        });
      }
      setIsDrawerOpen(false);
      loadPeriods();
    } catch (err: any) {
      setFormError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (p: EnrollmentPeriod) => {
    const next = p.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await enrollmentPeriodApi.updatePeriodStatus(p.id, next);
      loadPeriods();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = periods.filter((p) => {
    if (!search) return true;
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.periodCode.toLowerCase().includes(search.toLowerCase()) ||
      p.course?.title?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Quản lý Đợt Tuyển sinh
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Tạo và quản lý các đợt tuyển sinh cho từng khóa học</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Thêm Đợt Tuyển sinh
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm đợt tuyển sinh, mã đợt, tên khóa học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="UPCOMING">Sắp mở</option>
          <option value="OPEN">Đang mở</option>
          <option value="CLOSED">Đã đóng</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
        <button onClick={loadPeriods} className="p-2 text-slate-500 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Đợt / Mã đợt</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Khóa học</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Thời gian đăng ký</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Học phí</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Chỉ tiêu</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Trạng thái</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    Chưa có đợt tuyển sinh nào
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const st = STATUS_MAP[p.status as PeriodStatus] || STATUS_MAP.CLOSED;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="text-slate-400 font-mono text-[10px]">{p.periodCode}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{p.course?.title || '--'}</p>
                        <p className="text-slate-400 font-mono text-[10px]">{p.course?.courseCode}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <p>{formatDate(p.startRegistration)} →</p>
                        <p>{formatDate(p.endRegistration)}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{formatVND(p.tuitionFee)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-800">{p.currentEnrolled}</span>
                          <span className="text-slate-400">/ {p.maxCapacity}</span>
                        </div>
                        <div className="mt-1 h-1.5 bg-slate-200 rounded-full overflow-hidden w-20">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, (p.currentEnrolled / p.maxCapacity) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            title="Chỉnh sửa"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          {p.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleToggleStatus(p)}
                              title={p.status === 'OPEN' ? 'Đóng đợt' : 'Mở đợt'}
                              className={`p-1.5 rounded-lg transition ${
                                p.status === 'OPEN'
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              {p.status === 'OPEN' ? (
                                <ToggleRight className="h-4 w-4" />
                              ) : (
                                <ToggleLeft className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <span className="text-xs text-slate-500">
              Tổng: <strong>{meta.total}</strong> đợt tuyển sinh
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium text-slate-700">{page} / {meta.totalPages}</span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {editingPeriod ? 'Chỉnh sửa Đợt tuyển sinh' : 'Thêm Đợt tuyển sinh mới'}
              </h3>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khóa học <span className="text-rose-500">*</span></label>
                <select
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  disabled={!!editingPeriod}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title} ({c.courseCode})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mã đợt <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={form.periodCode}
                    onChange={(e) => setForm({ ...form, periodCode: e.target.value })}
                    disabled={!!editingPeriod}
                    placeholder="VD: PERIOD-WEB-K16"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sĩ số tối đa <span className="text-rose-500">*</span></label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxCapacity}
                    onChange={(e) => setForm({ ...form, maxCapacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên đợt tuyển sinh <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Khóa Lập trình Web K16 - Tháng 11/2026"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bắt đầu nhận đơn <span className="text-rose-500">*</span></label>
                  <input
                    type="datetime-local"
                    value={form.startRegistration}
                    onChange={(e) => setForm({ ...form, startRegistration: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kết thúc nhận đơn <span className="text-rose-500">*</span></label>
                  <input
                    type="datetime-local"
                    value={form.endRegistration}
                    onChange={(e) => setForm({ ...form, endRegistration: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Khai giảng dự kiến</label>
                  <input
                    type="datetime-local"
                    value={form.expectedStartDate}
                    onChange={(e) => setForm({ ...form, expectedStartDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Học phí (VND)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.tuitionFee}
                    onChange={(e) => setForm({ ...form, tuitionFee: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition disabled:opacity-60"
              >
                {isSaving ? 'Đang lưu...' : editingPeriod ? 'Lưu thay đổi' : 'Tạo đợt tuyển sinh'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
