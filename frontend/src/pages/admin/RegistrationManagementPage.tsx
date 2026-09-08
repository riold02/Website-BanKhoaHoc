import React, { useEffect, useState, useCallback } from 'react';
import {
  ClipboardList, Search, RefreshCw, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, Eye, X, AlertCircle, Calendar,
} from 'lucide-react';
import { registrationApi } from '../../services/registration.api';
import { Registration, RegistrationStatus } from '../../types/enrollment.types';
import { formatDate } from '../../utils/formatters';

const STATUS_TABS: { key: string; label: string }[] = [
  { key: '', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'APPROVED', label: 'Đã duyệt' },
  { key: 'REJECTED', label: 'Từ chối' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

const STATUS_STYLE: Record<RegistrationStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-600 border-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
};
const STATUS_LABEL: Record<RegistrationStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
};

export const RegistrationManagementPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);

  // Detail modal
  const [detailReg, setDetailReg] = useState<Registration | null>(null);

  // Review modal
  const [reviewReg, setReviewReg] = useState<Registration | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewNote, setReviewNote] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const loadRegistrations = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await registrationApi.getRegistrations({
        status: activeTab || undefined,
        page,
        limit: 10,
      });
      setRegistrations(result.registrations);
      setMeta({ page: result.meta?.page || 1, totalPages: result.meta?.totalPages || 1, total: result.meta?.total || 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const filtered = registrations.filter((r) => {
    if (!search) return true;
    const name = r.student?.user?.profile?.fullName?.toLowerCase() || '';
    const code = r.registrationCode.toLowerCase();
    const sc = r.student?.studentCode?.toLowerCase() || '';
    return name.includes(search.toLowerCase()) || code.includes(search.toLowerCase()) || sc.includes(search.toLowerCase());
  });

  const openReview = (reg: Registration, status: 'APPROVED' | 'REJECTED') => {
    setReviewReg(reg);
    setReviewStatus(status);
    setReviewNote('');
    setReviewError('');
  };

  const handleReview = async () => {
    if (!reviewReg) return;
    setIsReviewing(true);
    setReviewError('');
    try {
      await registrationApi.reviewRegistration(reviewReg.id, { status: reviewStatus, note: reviewNote });
      setReviewReg(null);
      loadRegistrations();
    } catch (err: any) {
      setReviewError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Xác nhận hủy đơn đăng ký này?')) return;
    try {
      await registrationApi.cancelRegistration(id);
      loadRegistrations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-blue-600" />
          Quản lý & Xét duyệt Đơn Đăng ký
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">Xem và xét duyệt đơn đăng ký tuyển sinh của học viên</p>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên học viên, mã đơn, mã HV..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
        <button onClick={loadRegistrations} className="p-2 text-slate-500 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Mã đơn</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Học viên</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Đợt tuyển sinh</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Ngày đăng ký</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Trạng thái</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    Không có đơn đăng ký nào
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const stCls = STATUS_STYLE[r.status as RegistrationStatus] || STATUS_STYLE.CANCELLED;
                  const stLabel = STATUS_LABEL[r.status as RegistrationStatus] || r.status;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-600">{r.registrationCode}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{r.student?.user?.profile?.fullName || '--'}</p>
                        <p className="text-slate-400 text-[10px]">HV: {r.student?.studentCode} · {r.student?.user?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{r.period?.course?.title || '--'}</p>
                        <p className="text-slate-400 text-[10px]">{r.period?.name}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(r.registrationDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${stCls}`}>
                          {stLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setDetailReg(r)}
                            title="Xem chi tiết"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {r.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => openReview(r, 'APPROVED')}
                                title="Phê duyệt"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => openReview(r, 'REJECTED')}
                                title="Từ chối"
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          {(r.status === 'PENDING' || r.status === 'APPROVED') && (
                            <button
                              onClick={() => handleCancel(r.id)}
                              title="Hủy đơn"
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                              <X className="h-3.5 w-3.5" />
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
            <span className="text-xs text-slate-500">Tổng: <strong>{meta.total}</strong> đơn đăng ký</span>
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

      {/* Detail Modal */}
      {detailReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDetailReg(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Chi tiết Đơn đăng ký</h3>
              <button onClick={() => setDetailReg(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-slate-400 text-[10px] font-semibold uppercase">Mã đơn</p>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">{detailReg.registrationCode}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-slate-400 text-[10px] font-semibold uppercase">Trạng thái</p>
                  <span className={`inline-flex mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLE[detailReg.status as RegistrationStatus]}`}>
                    {STATUS_LABEL[detailReg.status as RegistrationStatus]}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-slate-400 text-[10px] font-semibold uppercase mb-1">Học viên</p>
                <p className="font-semibold text-slate-900">{detailReg.student?.user?.profile?.fullName}</p>
                <p className="text-slate-500 text-[10px]">Mã HV: {detailReg.student?.studentCode} · {detailReg.student?.user?.email}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-slate-400 text-[10px] font-semibold uppercase mb-1">Đợt tuyển sinh</p>
                <p className="font-semibold text-slate-900">{detailReg.period?.course?.title}</p>
                <p className="text-slate-500 text-[10px]">{detailReg.period?.name}</p>
              </div>
              {detailReg.note && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-amber-700 text-[10px] font-semibold uppercase mb-0.5">Ghi chú</p>
                  <p className="text-amber-900">{detailReg.note}</p>
                </div>
              )}
              {detailReg.reviewedAt && (
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-slate-400 text-[10px] font-semibold uppercase mb-0.5">Xét duyệt lúc</p>
                  <p className="text-slate-700">{formatDate(detailReg.reviewedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setReviewReg(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold ${reviewStatus === 'APPROVED' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {reviewStatus === 'APPROVED' ? '✅ Phê duyệt đơn đăng ký' : '❌ Từ chối đơn đăng ký'}
              </h3>
              <button onClick={() => setReviewReg(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Học viên: <strong>{reviewReg.student?.user?.profile?.fullName}</strong>
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phản hồi / Ghi chú {reviewStatus === 'REJECTED' && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={
                  reviewStatus === 'APPROVED'
                    ? 'Ghi chú thêm (tùy chọn)...'
                    : 'Lý do từ chối đơn đăng ký...'
                }
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
              />
            </div>
            {reviewError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {reviewError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setReviewReg(null)}
                className="flex-1 py-2 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleReview}
                disabled={isReviewing}
                className={`flex-1 py-2 text-xs font-semibold text-white rounded-xl transition disabled:opacity-60 ${
                  reviewStatus === 'APPROVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                {isReviewing ? 'Đang xử lý...' : reviewStatus === 'APPROVED' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
