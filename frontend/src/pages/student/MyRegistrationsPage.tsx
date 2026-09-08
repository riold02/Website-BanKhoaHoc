import React, { useEffect, useState, useCallback } from 'react';
import { ClipboardList, Calendar, BookOpen, AlertCircle, CheckCircle, Clock, XCircle, X } from 'lucide-react';
import { registrationApi } from '../../services/registration.api';
import { Registration, RegistrationStatus } from '../../types/enrollment.types';
import { formatDate, formatVND } from '../../utils/formatters';

const STATUS_STYLE: Record<RegistrationStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-600 border-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-200',
};
const STATUS_LABEL: Record<RegistrationStatus, string> = {
  PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', CANCELLED: 'Đã hủy',
};
const STATUS_ICON: Record<RegistrationStatus, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4 text-amber-500" />,
  APPROVED: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  REJECTED: <XCircle className="h-4 w-4 text-rose-500" />,
  CANCELLED: <X className="h-4 w-4 text-slate-400" />,
};

export const MyRegistrationsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await registrationApi.getRegistrations({ limit: 50 });
      setRegistrations(result.registrations);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn đăng ký.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn đăng ký này?')) return;
    setCancellingId(id);
    try {
      await registrationApi.cancelRegistration(id);
      load();
    } catch (err: any) {
      alert(err.message || 'Hủy đơn thất bại.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 text-white pt-14 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 mb-4">
            <ClipboardList className="h-3.5 w-3.5" />
            Cổng Học viên
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Đơn Đăng Ký Của Tôi
          </h1>
          <p className="mt-3 text-sm text-blue-100/80 max-w-xl mx-auto">
            Theo dõi trạng thái xét duyệt đơn đăng ký tuyển sinh của bạn
          </p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-20 text-center">
            <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Đang tải đơn đăng ký...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-rose-200 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 py-16 text-center px-8">
            <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-slate-800">Chưa có đơn đăng ký nào</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Bạn chưa đăng ký khóa học nào. Hãy truy cập trang Khóa học để tìm và đăng ký nhé.
            </p>
            <a
              href="/courses"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Xem danh sách khóa học
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((r) => {
              const stCls = STATUS_STYLE[r.status as RegistrationStatus] || STATUS_STYLE.CANCELLED;
              const stLabel = STATUS_LABEL[r.status as RegistrationStatus] || r.status;
              const stIcon = STATUS_ICON[r.status as RegistrationStatus];
              return (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
                  {/* Status bar */}
                  <div className={`h-1 w-full ${
                    r.status === 'APPROVED' ? 'bg-emerald-400' :
                    r.status === 'PENDING' ? 'bg-amber-400' :
                    r.status === 'REJECTED' ? 'bg-rose-400' : 'bg-slate-300'
                  }`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-slate-400">{r.registrationCode}</p>
                        <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                          {r.period?.course?.title || '--'}
                        </h3>
                        <p className="text-xs text-blue-600 font-medium mt-0.5">{r.period?.name}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${stCls}`}>
                        {stIcon}
                        {stLabel}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Đăng ký: <strong>{formatDate(r.registrationDate)}</strong></span>
                      </div>
                      {r.period?.tuitionFee !== undefined && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>Học phí: <strong>{formatVND(r.period.tuitionFee)}</strong></span>
                        </div>
                      )}
                      {r.period?.expectedStartDate && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>Khai giảng: <strong>{formatDate(r.period.expectedStartDate)}</strong></span>
                        </div>
                      )}
                    </div>

                    {r.note && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Ghi chú: </span>{r.note}
                      </div>
                    )}

                    {r.status === 'PENDING' && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleCancel(r.id)}
                          disabled={cancellingId === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 transition disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          {cancellingId === r.id ? 'Đang hủy...' : 'Hủy đơn'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
