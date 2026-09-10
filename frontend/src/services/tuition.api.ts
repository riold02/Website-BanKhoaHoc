import { apiClient } from './api.client';
import { ApiSuccessResponse } from '../types/api.types';

export type TuitionInvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID';
export type TuitionPaymentMethod = 'CASH' | 'BANK_TRANSFER';

export interface TuitionInvoiceApiItem {
  id: string;
  invoiceCode: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: TuitionInvoiceStatus;
  dueDate?: string | null;
  createdAt?: string;
  registration: {
    id: string;
    student: {
      id: string;
      studentCode?: string | null;
      user?: {
        profile?: {
          fullName?: string | null;
        } | null;
      } | null;
    };
    period: {
      id: string;
      name?: string | null;
      course?: {
        title?: string | null;
      } | null;
    };
  };
  transactions?: Array<{
    id: string;
    amount?: number | string | null;
    paymentDate?: string | null;
    paymentMethod?: TuitionPaymentMethod | null;
    referenceNumber?: string | null;
    note?: string | null;
  }>;
}

export const tuitionApi = {
  async getInvoices(params?: {
    status?: string;
    studentId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ invoices: TuitionInvoiceApiItem[]; meta: any }> {
    const res = await apiClient.get<ApiSuccessResponse<TuitionInvoiceApiItem[]>>('/tuitions', { params });

    return {
      invoices: res.data.data,
      meta: res.data.meta ?? {},
    };
  },

  async recordPayment(
    invoiceId: string,
    payload: {
      amount: number;
      paymentMethod: TuitionPaymentMethod;
      referenceNumber?: string;
      note?: string;
    }
  ): Promise<TuitionInvoiceApiItem> {
    const res = await apiClient.post<ApiSuccessResponse<TuitionInvoiceApiItem>>(`/tuitions/${invoiceId}/payments`, payload);
    return res.data.data;
  },
};
