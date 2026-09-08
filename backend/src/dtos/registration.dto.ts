import { z } from 'zod';

export const createRegistrationSchema = z.object({
  body: z.object({
    periodId: z.string().uuid({ message: 'periodId phải là UUID hợp lệ' }),
    note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional().nullable(),
  }),
});

export const reviewRegistrationSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED'], {
      errorMap: () => ({ message: 'Trạng thái xét duyệt phải là APPROVED hoặc REJECTED' }),
    }),
    note: z.string().max(500).optional().nullable(),
  }),
});

export const registrationQuerySchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
    periodId: z.string().uuid().optional(),
    studentId: z.string().uuid().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
