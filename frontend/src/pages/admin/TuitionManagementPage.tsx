import React, { useEffect, useMemo, useState } from 'react';
import {
  CircleDollarSign,
  Search,
  Wallet,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ReceiptText,
  CreditCard,
  Sparkles,
  FileDown,
} from 'lucide-react';
import { tuitionApi, TuitionInvoiceApiItem } from '../../services/tuition.api';
import { exportApi } from '../../services/export.api';
import { formatDate, formatVND } from '../../utils/formatters';

type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

interface TuitionInvoice {
  id: string;
  invoiceCode: string;
  studentName: string;
  studentCode: string;
  courseName: string;
  periodName: string;
  totalAmount: number;
  paidAmount: number;
  dueDate?: string | null;
  paymentStatus: InvoiceStatus;
  lastPaymentDate?: string;
  paymentMethod?: string;
  note?: string;
  transactions: Array<{
    id: string;
    amount: number;
    paymentDate?: string | null;
    paymentMethod?: string | null;
    referenceNumber?: string | null;
    note?: string | null;
  }>;
}

const STATUS_META: Record<InvoiceStatus, { label: string; className: string }> = {
  UNPAID: {
    label: 'Chưa thu',
    className: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
  PARTIAL: {
    label: 'Đang thu',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  PAID: {
    label: 'Đã thu đủ',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
};

const tabs = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'UNPAID', label: 'Chưa thu' },
  { key: 'PARTIAL', label: 'Đang thu' },
  { key: 'PAID', label: 'Đã thu đủ' },
] as const;

export const TuitionManagementPage: React.FC = () => {
  const [invoices, setInvoices] = useState<TuitionInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['key']>('ALL');
  const [toast, setToast] = useState<string | null>(null);
  const [isExportingReport, setIsExportingReport] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<TuitionInvoice | null>(null);
  const [selectedNoteInvoice, setSelectedNoteInvoice] = useState<TuitionInvoice | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'CASH' as 'CASH' | 'BANK_TRANSFER',
    referenceNumber: '',
    note: '',
  });

  const mapInvoice = (item: TuitionInvoiceApiItem): TuitionInvoice => {
    const uniqueTransactions = (item.transactions ?? []).reduce<Array<{ id: string; amount: number; paymentDate?: string | null; paymentMethod?: string | null; referenceNumber?: string | null; note?: string | null }>>((acc, transaction) => {
      if (!transaction?.id || acc.some((current) => current.id === transaction.id)) {
        return acc;
      }

      acc.push({
        id: transaction.id,
        amount: Number(transaction.amount) || 0,
        paymentDate: transaction.paymentDate || undefined,
        paymentMethod: transaction.paymentMethod || undefined,
        referenceNumber: transaction.referenceNumber || undefined,
        note: transaction.note || undefined,
      });
      return acc;
    }, []);

    return {
      id: item.id,
      invoiceCode: item.invoiceCode,
      studentName: item.registration?.student?.user?.profile?.fullName || 'Không rõ',
      studentCode: item.registration?.student?.studentCode || '---',
      courseName: item.registration?.period?.course?.title || 'Không rõ',
      periodName: item.registration?.period?.name || '---',
      totalAmount: Number(item.totalAmount) || 0,
      paidAmount: Number(item.paidAmount) || 0,
      dueDate: item.dueDate || undefined,
      paymentStatus: (item.paymentStatus as InvoiceStatus) || 'UNPAID',
      lastPaymentDate: uniqueTransactions[0]?.paymentDate || undefined,
      paymentMethod: uniqueTransactions[0]?.paymentMethod || 'CASH',
      note: uniqueTransactions[0]?.note || undefined,
      transactions: uniqueTransactions,
    };
  };

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const result = await tuitionApi.getInvoices({ status: activeTab === 'ALL' ? undefined : activeTab, limit: 100 });
      setInvoices(result.invoices.map(mapInvoice));
    } catch (error: any) {
      setInvoices([]);
      setToast(error?.message || 'Không thể tải danh sách hóa đơn');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [activeTab]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const keyword = search.trim().toLowerCase();
      const matchesSearch =
        !keyword ||
        invoice.studentName.toLowerCase().includes(keyword) ||
        invoice.studentCode.toLowerCase().includes(keyword) ||
        invoice.courseName.toLowerCase().includes(keyword) ||
        invoice.invoiceCode.toLowerCase().includes(keyword) ||
        invoice.id.toLowerCase().includes(keyword);

      return matchesSearch;
    });
  }, [invoices, search]);

  const summary = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
    const totalDue = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount - invoice.paidAmount), 0);
    const paidCount = invoices.filter((invoice) => invoice.paymentStatus === 'PAID').length;
    return {
      totalRevenue,
      totalDue,
      paidCount,
      totalInvoices: invoices.length,
    };
  }, [invoices]);

  const handleExportTuitionReport = async () => {
    setIsExportingReport(true);
    try {
      await exportApi.exportTuitionReport();
      setToast('Đã xuất báo cáo học phí thành công');
    } catch (error: any) {
      setToast(error?.message || 'Không thể xuất báo cáo học phí');
    } finally {
      setIsExportingReport(false);
    }
  };

  const openPaymentModal = (invoice: TuitionInvoice) => {
    const remaining = Math.max(0, invoice.totalAmount - invoice.paidAmount);
    const defaultAmount = remaining > 0 ? Math.min(remaining, Math.max(500000, Math.round(remaining * 0.3))) : 0;

    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: String(defaultAmount),
      paymentMethod: invoice.paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'CASH',
      referenceNumber: '',
      note: '',
    });
  };

  const openNoteHistory = (invoice: TuitionInvoice) => {
    setSelectedNoteInvoice(invoice);
  };

  const submitPayment = async () => {
    if (!selectedInvoice || isSubmittingPayment) return;

    const amount = Number(paymentForm.amount);
    const remaining = Math.max(0, selectedInvoice.totalAmount - selectedInvoice.paidAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setToast('Vui lòng nhập số tiền thanh toán hợp lệ');
      return;
    }

    if (amount > remaining) {
      setToast(`Số tiền thanh toán không được vượt quá ${formatVND(remaining)}`);
      return;
    }

    if (paymentForm.paymentMethod === 'BANK_TRANSFER' && !paymentForm.referenceNumber.trim()) {
      setToast('Vui lòng nhập mã tham chiếu ngân hàng cho thanh toán chuyển khoản');
      return;
    }

    setIsSubmittingPayment(true);

    try {
      await tuitionApi.recordPayment(selectedInvoice.id, {
        amount,
        paymentMethod: paymentForm.paymentMethod,
        referenceNumber: paymentForm.referenceNumber.trim() || undefined,
        note: paymentForm.note.trim() || undefined,
      });

      setSelectedInvoice(null);
      await loadInvoices();
      setToast('Đã ghi nhận thanh toán thành công');
    } catch (error: any) {
      setToast(error?.message || 'Ghi nhận thanh toán thất bại');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-blue-600" />
            Sổ Theo Dõi Thu Học Phí & Công Nợ
          </h2>
          <p className="text-xs text-slate-500 mt-1">Theo dõi doanh thu, nợ học phí và ghi nhận thanh toán của học viên</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Giáo vụ đang theo dõi
        </div>
      </div>

      {toast && (
        <div className="fixed right-5 top-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-lg">
          <Sparkles className="h-4 w-4" />
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Tổng hóa đơn</p>
            <CircleDollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{summary.totalInvoices}</p>
          <p className="mt-1 text-[11px] text-slate-500">Sổ thu học phí</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Đã thu</p>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600">{formatVND(summary.totalRevenue)}</p>
          <p className="mt-1 text-[11px] text-slate-500">Tổng tiền đã thu</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Công nợ</p>
            <Wallet className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600">{formatVND(summary.totalDue)}</p>
          <p className="mt-1 text-[11px] text-slate-500">Số tiền còn cần thu</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Đã đóng đủ</p>
            <CheckCircle2 className="h-4 w-4 text-sky-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-sky-600">{summary.paidCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Hóa đơn đã thanh toán</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === tab.key ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExportTuitionReport}
              disabled={isExportingReport}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExportingReport ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" /> : <FileDown className="h-4 w-4" />}
              {isExportingReport ? 'Đang tải...' : 'Xuất Excel'}
            </button>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm học viên, mã hóa đơn, khóa học..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Ghi nhận thu tiền</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{selectedInvoice.studentName}</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Hóa đơn</span>
                <span className="font-semibold text-slate-800">{selectedInvoice.invoiceCode}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span>Còn nợ</span>
                <span className="font-semibold text-amber-700">{formatVND(Math.max(0, selectedInvoice.totalAmount - selectedInvoice.paidAmount))}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="text-xs font-medium text-slate-600">
                Số tiền thanh toán
                <input
                  type="number"
                  min={0}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </label>

              <label className="text-xs font-medium text-slate-600">
                Phương thức
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentMethod: e.target.value as 'CASH' | 'BANK_TRANSFER' }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK_TRANSFER">Chuyển khoản</option>
                </select>
              </label>

              {paymentForm.paymentMethod === 'BANK_TRANSFER' && (
                <label className="text-xs font-medium text-slate-600">
                  Mã tham chiếu ngân hàng
                  <input
                    type="text"
                    value={paymentForm.referenceNumber}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, referenceNumber: e.target.value }))}
                    placeholder="VD: BFT-123456789"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>
              )}

              <label className="text-xs font-medium text-slate-600">
                Ghi chú
                <textarea
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm((prev) => ({ ...prev, note: e.target.value }))}
                  rows={3}
                  placeholder="Ghi chú thanh toán..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={submitPayment}
                disabled={isSubmittingPayment}
                className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmittingPayment ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedNoteInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Ghi chú thanh toán</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">{selectedNoteInvoice.studentName}</h3>
              </div>
              <button
                onClick={() => setSelectedNoteInvoice(null)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
              >
                Đóng
              </button>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Mã hóa đơn</span>
                <span className="font-semibold text-slate-800">{selectedNoteInvoice.invoiceCode}</span>
              </div>
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {selectedNoteInvoice.transactions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 text-center">
                  Chưa có ghi chú nào cho hóa đơn này.
                </div>
              ) : (
                selectedNoteInvoice.transactions.map((transaction) => {
                  const paymentDate = transaction.paymentDate ? new Date(transaction.paymentDate) : null;
                  const displayDate = paymentDate ? paymentDate.toLocaleDateString('vi-VN') : '---';
                  const displayTime = paymentDate ? paymentDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '---';
                  const content = transaction.note?.trim() ? transaction.note.trim() : 'Không có nội dung ghi chú';

                  return (
                    <div key={transaction.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500">
                        <span>{displayDate}</span>
                        <span>{displayTime}</span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-slate-600">Nội dung ghi chú</span>
                        <span className="text-xs font-semibold text-emerald-700">{formatVND(transaction.amount)}</span>
                      </div>

                      <p className="mt-2 text-sm font-medium text-slate-800">{content}</p>

                      {transaction.referenceNumber && (
                        <div className="mt-2 text-[11px] text-slate-500">
                          Mã tham chiếu: <span className="font-semibold text-slate-700">{transaction.referenceNumber}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Mã hóa đơn</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Học viên</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Khóa học</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Tổng tiền</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Đã thu</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Còn nợ</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Hạn nộp</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Trạng thái</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Ghi chú</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <div className="mt-3">Đang tải sổ thu học phí...</div>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-6 w-6 text-slate-300" />
                      <span>Không có dữ liệu hóa đơn phù hợp</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const remaining = Math.max(0, invoice.totalAmount - invoice.paidAmount);
                  const statusMeta = STATUS_META[invoice.paymentStatus];

                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-mono text-[10px] font-semibold text-slate-700">{invoice.invoiceCode}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{invoice.studentName}</p>
                        <p className="text-[10px] text-slate-500">{invoice.studentCode}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{invoice.courseName}</p>
                        <p className="text-[10px] text-slate-500">{invoice.periodName}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{formatVND(invoice.totalAmount)}</td>
                      <td className="px-4 py-3 text-emerald-700 font-semibold">{formatVND(invoice.paidAmount)}</td>
                      <td className="px-4 py-3 text-amber-700 font-semibold">{formatVND(remaining)}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(invoice.dueDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openNoteHistory(invoice)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[10px] font-semibold text-violet-700 hover:bg-violet-100 transition"
                        >
                          Xem
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openPaymentModal(invoice)}
                            disabled={invoice.paidAmount >= invoice.totalAmount}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            {invoice.paidAmount >= invoice.totalAmount ? 'Đã thu đủ' : 'Ghi nhận'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TuitionManagementPage;
