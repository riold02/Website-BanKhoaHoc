import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Calendar,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  X,
  Receipt,
  CreditCard,
  CheckCheck,
  WalletCards,
} from 'lucide-react';
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
  const navigate = useNavigate();
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

  const pendingCount = registrations.filter((r) => r.status === 'PENDING').length;
  const approvedCount = registrations.filter((r) => r.status === 'APPROVED').length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 text-white pt-12 pb-18 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 mb-3">
              <ClipboardList className="h-3.5 w-3.5" />
              Cổng Học Viên Chính Quy
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Đơn Đăng Ký Của Tôi
            </h1>
            <p className="mt-2 text-sm text-blue-100/80 max-w-xl">
              Theo dõi trạng thái xét duyệt đơn tuyển sinh, hạn đóng học phí và thông tin lớp học.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <BookOpen className="h-4 w-4" />
              Đăng ký thêm khóa mới
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Main List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {isLoading ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 py-20 text-center">
                <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Đang tải danh sách đơn đăng ký...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-3xl shadow-sm border border-rose-200 p-8 text-center">
                <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-rose-700">{error}</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 py-16 text-center px-8">
                <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-base font-bold text-slate-800">Chưa có đơn đăng ký nào</h3>
                <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Bạn chưa đăng ký khóa học nào. Hãy khám phá danh mục các khóa đào tạo ngắn hạn để chọn lớp học phù hợp.
                </p>
                <a
                  href="/courses"
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
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

                    {/* ── TASK-210: Invoice info khi đơn đã được duyệt ─────── */}
                    {r.status === 'APPROVED' && r.invoice && (
                      <div className="mt-3 p-3 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                            <Receipt className="h-3.5 w-3.5" />
                            Hóa đơn học phí
                          </div>
                          {/* paymentStatus badge */}
                          {r.invoice.paymentStatus === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <CheckCheck className="h-3 w-3" /> Đã đóng đủ
                            </span>
                          ) : r.invoice.paymentStatus === 'PARTIAL' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                              <CreditCard className="h-3 w-3" /> Đóng một phần
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                              <CreditCard className="h-3 w-3" /> Chưa đóng
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white rounded-lg p-2 border border-amber-100">
                            <p className="text-[9px] text-slate-400 uppercase font-semibold">Tổng học phí</p>
                            <p className="text-xs font-bold font-mono text-slate-800 mt-0.5">{formatVND(r.invoice.totalAmount)}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-amber-100">
                            <p className="text-[9px] text-slate-400 uppercase font-semibold">Đã nộp</p>
                            <p className="text-xs font-bold font-mono text-emerald-700 mt-0.5">{formatVND(r.invoice.paidAmount)}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-amber-100">
                            <p className="text-[9px] text-slate-400 uppercase font-semibold">Còn lại</p>
                            <p className="text-xs font-bold font-mono text-rose-600 mt-0.5">
                              {formatVND(Math.max(0, r.invoice.totalAmount - r.invoice.paidAmount))}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-[10px] text-slate-400 font-mono">Mã HĐ: {r.invoice.invoiceCode}</p>
                          <button
                            onClick={() => navigate('/my-tuition')}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition shadow-2xs"
                          >
                            <WalletCards className="h-3 w-3" />
                            Xem học phí & Quét mã QR
                          </button>
                        </div>
                      </div>
                    )}
                    {/* ────────────────────────────────────────────────────── */}

                    <div className="mt-4 flex justify-end gap-2">
                      {r.status === 'APPROVED' && !r.invoice && (
                        <button
                          onClick={() => navigate('/my-tuition')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition"
                        >
                          <WalletCards className="h-3.5 w-3.5" />
                          Xem học phí
                        </button>
                      )}

                      {r.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(r.id)}
                          disabled={cancellingId === r.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 transition disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          {cancellingId === r.id ? 'Đang hủy...' : 'Hủy đơn'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </div>

          {/* Right Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Status Summary */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Tổng Quan Đơn Đăng Ký
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xl font-black text-slate-900">{registrations.length}</p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Tổng đơn</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                  <p className="text-xl font-black text-emerald-600">{approvedCount}</p>
                  <p className="text-[10px] font-semibold text-emerald-700 mt-0.5">Đã duyệt</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                  <p className="text-xl font-black text-amber-600">{pendingCount}</p>
                  <p className="text-[10px] font-semibold text-amber-700 mt-0.5">Chờ duyệt</p>
                </div>
              </div>
            </div>

            {/* Workflow Guide */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-blue-600" />
                Quy Trình Xét Duyệt
              </h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <strong className="text-slate-800">Tiếp nhận & Rà soát hồ sơ:</strong> Giáo vụ kiểm tra thông tin và đối chiếu số lượng chỉ tiêu của đợt.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <strong className="text-slate-800">Phê duyệt & Xuất hóa đơn:</strong> Đơn được duyệt sẽ tự động kích hoạt hóa đơn học phí kèm mã QR.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <strong className="text-slate-800">Xếp lớp & Thông báo:</strong> Học viên theo dõi lịch học tại Cổng học tập cá nhân.
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
              <a
                href="/my-tuition"
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition text-xs font-semibold text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <WalletCards className="h-4 w-4 text-blue-600" />
                  <span>Tra cứu hóa đơn học phí</span>
                </div>
              </a>
              <a
                href="/my-learning"
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition text-xs font-semibold text-slate-700"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span>Cổng học tập cá nhân</span>
                </div>
              </a>
            </div>

            {/* Help Callout */}
            <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5 text-xs text-blue-900">
              <p className="font-bold mb-1">Cần hỗ trợ tuyển sinh?</p>
              <p className="text-blue-800/80 leading-relaxed">
                Nếu bạn cần điều chỉnh đợt học hoặc hủy đơn gấp, vui lòng liên hệ hotline <strong>(0263) 3822 246</strong> hoặc qua trang <a href="/admissions" className="underline font-semibold">Hỗ trợ tuyển sinh</a>.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
