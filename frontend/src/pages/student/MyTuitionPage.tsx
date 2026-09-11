import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowRight, Banknote, CheckCircle2, CircleDollarSign, Clock3, CreditCard, FileText, QrCode, ShieldCheck } from 'lucide-react';
import { tuitionApi, TuitionInvoiceApiItem } from '../../services/tuition.api';
import { formatDate, formatVND } from '../../utils/formatters';

const STATUS_STYLE: Record<string, string> = {
  UNPAID: 'bg-rose-50 text-rose-700 border-rose-200',
  PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUS_LABEL: Record<string, string> = {
  UNPAID: 'Chưa thanh toán',
  PARTIAL: 'Đã đóng một phần',
  PAID: 'Đã thanh toán',
};

const getTransferInfo = (invoice: TuitionInvoiceApiItem) => {
  return (
    invoice.transferInfo ??
    invoice.paymentInfo ??
    invoice.bankInfo ??
    invoice.bankTransferInfo ??
    invoice.transferInstructions ??
    invoice.paymentInstructions ??
    null
  );
};

const QRCodeDemo: React.FC<{ value: string }> = ({ value }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(value, {
      width: 220,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url: string) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [value]);

  if (!qrDataUrl) {
    return (
      <div className="flex h-[220px] w-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-xs text-slate-400 shadow-inner shadow-slate-200">
        Đang tạo mã QR...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 shadow-inner shadow-slate-200">
      <img src={qrDataUrl} alt="Mã QR thanh toán học phí" className="h-[220px] w-[220px] rounded-xl" />
    </div>
  );
};

export const MyTuitionPage: React.FC = () => {
  const [invoices, setInvoices] = useState<TuitionInvoiceApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await tuitionApi.getMyInvoices();
        setInvoices(data);
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin học phí của bạn.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const summary = useMemo(() => {
    const total = invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0);
    const paid = invoices.reduce((sum, invoice) => sum + Number(invoice.paidAmount || 0), 0);
    const remaining = Math.max(0, total - paid);

    return { total, paid, remaining };
  }, [invoices]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="max-w-5xl mx-auto rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-500">Đang tải học phí của bạn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="max-w-3xl mx-auto rounded-3xl border border-rose-200 bg-rose-50 p-10 text-center">
          <p className="text-base font-bold text-rose-700">Không thể tải học phí</p>
          <p className="mt-2 text-sm text-rose-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <section className="bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-white/5 px-3 py-1 text-xs font-semibold text-blue-100">
            <CircleDollarSign className="h-3.5 w-3.5" />
            Cổng học viên
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Học phí của tôi</h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-100">
            Theo dõi tổng số tiền phải đóng, số tiền đã nộp và hướng dẫn chuyển khoản thanh toán theo hóa đơn.
          </p>
        </div>
      </section>

      <main className="mx-auto -mt-8 max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tổng phải đóng</span>
              <Banknote className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900">{formatVND(summary.total)}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đã nộp</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-3 text-2xl font-black text-emerald-600">{formatVND(summary.paid)}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Còn nợ</span>
              <Clock3 className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-3 text-2xl font-black text-amber-600">{formatVND(summary.remaining)}</p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-base font-bold text-slate-800">Bạn chưa có hóa đơn học phí nào</h2>
            <p className="mt-2 text-sm text-slate-500">
              Khi đơn đăng ký được duyệt, hệ thống sẽ tự tạo hóa đơn cho bạn để thanh toán.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-5">
              {invoices.map((invoice) => {
                const transferInfo = getTransferInfo(invoice);
                const remaining = Math.max(0, Number(invoice.totalAmount || 0) - Number(invoice.paidAmount || 0));

                return (
                  <div key={invoice.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Mã hóa đơn</p>
                        <h2 className="mt-1 text-lg font-black text-slate-900">{invoice.invoiceCode}</h2>
                      </div>

                      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLE[invoice.paymentStatus] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {STATUS_LABEL[invoice.paymentStatus] || invoice.paymentStatus}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tổng học phí</p>
                        <p className="mt-1 text-xl font-black text-slate-900">{formatVND(Number(invoice.totalAmount || 0))}</p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Đã nộp</p>
                        <p className="mt-1 text-xl font-black text-emerald-600">{formatVND(Number(invoice.paidAmount || 0))}</p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Còn lại</p>
                        <p className="mt-1 text-xl font-black text-amber-600">{formatVND(remaining)}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Khóa học</p>
                        <p className="mt-1 font-semibold text-slate-800">{invoice.registration?.period?.course?.title || '--'}</p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Hạn thanh toán</p>
                        <p className="mt-1 font-semibold text-slate-800">{formatDate(invoice.dueDate || undefined)}</p>
                      </div>
                    </div>

                    {transferInfo && (
                      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                        <div className="flex items-center gap-2 text-blue-700">
                          <ShieldCheck className="h-4 w-4" />
                          <span className="text-sm font-bold">Thông tin chuyển khoản</span>
                        </div>

                        <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ngân hàng</p>
                            <p className="mt-1 font-semibold text-slate-800">{transferInfo.bankName || 'Vietcombank'}</p>
                          </div>

                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Số tài khoản</p>
                            <p className="mt-1 font-semibold text-slate-800">{transferInfo.accountNumber || '--'}</p>
                          </div>

                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Chủ tài khoản</p>
                            <p className="mt-1 font-semibold text-slate-800">{transferInfo.accountHolder || '--'}</p>
                          </div>

                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Nội dung chuyển khoản</p>
                            <p className="mt-1 font-semibold text-slate-800">{transferInfo.transferContent || invoice.invoiceCode}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900">
                  <QrCode className="h-4 w-4 text-blue-600" />
                  <h3 className="text-base font-black">Mã QR mẫu</h3>
                </div>

                <div className="mt-4 flex justify-center rounded-2xl bg-slate-100 p-3">
                  <QRCodeDemo value={`HP ${invoices[0]?.invoiceCode || 'INV-XXXX'}`} />
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Quét mã QR để chuyển khoản nhanh. Vui lòng ghi đúng nội dung chuyển khoản để hệ thống đối chiếu hóa đơn.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900">
                  <CreditCard className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-base font-black">Hướng dẫn thanh toán</h3>
                </div>

                <ol className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">1</span>
                    <span>Chuyển khoản theo thông tin ngân hàng hiển thị trên hóa đơn.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">2</span>
                    <span>Ghi đúng nội dung: <strong>HP {invoices[0]?.invoiceCode || 'INV-XXXX'}</strong>.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">3</span>
                    <span>Gửi xác nhận hoặc lưu mã giao dịch để giáo vụ đối soát nhanh hơn.</span>
                  </li>
                </ol>

                <button
                  type="button"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Liên hệ hỗ trợ
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTuitionPage;
