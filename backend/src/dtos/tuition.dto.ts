import { z } from 'zod';

export const tuitionQuerySchema = z.object({
  query: z.object({
    status: z.enum(['UNPAID', 'PARTIAL', 'PAID']).optional(),
    studentId: z.string().uuid().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export const createPaymentSchema = z.object({
  body: z.object({
    amount: z.number().int().positive('Số tiền thanh toán phải lớn hơn 0'),
    paymentMethod: z.enum(['CASH', 'BANK_TRANSFER'], {
      errorMap: () => ({ message: 'Phương thức thanh toán phải là CASH hoặc BANK_TRANSFER' }),
    }),
    referenceNumber: z.string().max(100, 'Mã tham chiếu tối đa 100 ký tự').optional().nullable(),
    note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional().nullable(),
  }),
});
