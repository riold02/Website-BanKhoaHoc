import React, { useEffect, useState, useCallback } from 'react';
import {
  GraduationCap, Search, RefreshCw, ChevronLeft, ChevronRight,
  Eye, X, User, Mail, Phone, CreditCard, BookOpen, Calendar, FileDown,
} from 'lucide-react';
import { studentApi } from '../../services/student.api';
import { exportApi } from '../../services/export.api';
import { Student, Registration, RegistrationStatus } from '../../types/enrollment.types';
import { formatDate } from '../../utils/formatters';

const STATUS_STYLE: Record<RegistrationStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-600 border-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
};
const STATUS_LABEL: Record<RegistrationStatus, string> = {
  PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', CANCELLED: 'Đã hủy',
};

export const StudentManagementPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isExportingGrades, setIsExportingGrades] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await studentApi.getStudents({ search: search || undefined, page, limit: 10 });
      setStudents(result.students);
      setMeta({ page: result.meta?.page || 1, totalPages: result.meta?.totalPages || 1, total: result.meta?.total || 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleExportGrades = async () => {
    setIsExportingGrades(true);
    try {
      await exportApi.exportGrades();
    } catch (err: any) {
      setToast(err.message || 'Không thể xuất bảng điểm');
    } finally {
      setIsExportingGrades(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const openDetail = async (s: Student) => {
    setDetailStudent(s);
    setIsLoadingDetail(true);
    try {
      const full = await studentApi.getStudentById(s.id);
      setDetailStudent(full);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          Quản lý Học viên
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Danh sách toàn bộ học viên và lịch sử đăng ký trong hệ thống</p>
      </div>

      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-lg">
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <form onSubmit={handleSearch} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã HV, CCCD, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
        >
          Tìm kiếm
        </button>
        <button
          type="button"
          onClick={handleExportGrades}
          disabled={isExportingGrades}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExportingGrades ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" /> : <FileDown className="h-4 w-4" />}
          {isExportingGrades ? 'Đang tải...' : 'Xuất Excel'}
        </button>
        <button
          type="button"
          onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
          className="p-2 text-slate-500 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Mã HV</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Họ tên</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Email / SĐT</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">CCCD</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Trình độ</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Đơn ĐK</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Chi tiết</th>
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
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">Chưa có học viên nào</td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{s.studentCode}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {s.user?.profile?.fullName?.charAt(0) || 'H'}
                        </div>
                        <span className="font-semibold text-slate-900">{s.user?.profile?.fullName || '--'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>{s.user?.email}</p>
                      <p className="text-slate-400 text-[10px]">{s.user?.profile?.phone || '--'}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">{s.idCardNumber || '--'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.educationLevel || '--'}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{s._count?.registrations ?? 0}</span>
                      <span className="text-slate-400 ml-1">đơn</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => openDetail(s)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <span className="text-xs text-slate-500">Tổng: <strong>{meta.total}</strong> học viên</span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium">{page} / {meta.totalPages}</span>
              <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {detailStudent && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDetailStudent(null)} />
          <div className="relative ml-auto w-full max-w-lg bg-white h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                  {detailStudent.user?.profile?.fullName?.charAt(0) || 'H'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{detailStudent.user?.profile?.fullName}</h3>
                  <p className="text-xs text-blue-600 font-semibold">{detailStudent.studentCode}</p>
                </div>
              </div>
              <button onClick={() => setDetailStudent(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {isLoadingDetail ? (
                <div className="py-10 text-center">
                  <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <>
                  {/* Personal Info */}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Thông tin cá nhân</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: <User className="h-3.5 w-3.5" />, label: 'Họ tên', value: detailStudent.user?.profile?.fullName },
                        { icon: <Mail className="h-3.5 w-3.5" />, label: 'Email', value: detailStudent.user?.email },
                        { icon: <Phone className="h-3.5 w-3.5" />, label: 'SĐT', value: detailStudent.user?.profile?.phone || '--' },
                        { icon: <CreditCard className="h-3.5 w-3.5" />, label: 'CCCD', value: detailStudent.idCardNumber || '--' },
                        { icon: <Calendar className="h-3.5 w-3.5" />, label: 'Ngày sinh', value: formatDate(detailStudent.birthDate) },
                        { icon: <User className="h-3.5 w-3.5" />, label: 'Giới tính', value: detailStudent.gender || '--' },
                        { icon: <BookOpen className="h-3.5 w-3.5" />, label: 'Trình độ', value: detailStudent.educationLevel || '--' },
                        { icon: <Calendar className="h-3.5 w-3.5" />, label: 'Ngày tham gia', value: formatDate(detailStudent.createdAt) },
                      ].map(({ icon, label, value }) => (
                        <div key={label} className="p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-1.5 text-slate-400 mb-1">{icon}<span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span></div>
                          <p className="text-xs font-medium text-slate-800 truncate">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Registrations */}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Lịch sử Đăng ký ({detailStudent.registrations?.length || 0} đơn)
                    </h4>
                    {!detailStudent.registrations || detailStudent.registrations.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Chưa có đơn đăng ký nào</p>
                    ) : (
                      <div className="space-y-2">
                        {detailStudent.registrations.map((r: Registration) => {
                          const stCls = STATUS_STYLE[r.status as RegistrationStatus] || STATUS_STYLE.CANCELLED;
                          const stLabel = STATUS_LABEL[r.status as RegistrationStatus] || r.status;
                          return (
                            <div key={r.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">{r.period?.course?.title || '--'}</p>
                                <p className="text-[10px] text-slate-500 truncate">{r.period?.name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{r.registrationCode}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${stCls}`}>
                                  {stLabel}
                                </span>
                                <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(r.registrationDate)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
