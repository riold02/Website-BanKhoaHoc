import { z } from 'zod';

export const createEnrollmentPeriodSchema = z.object({
  body: z.object({
    courseId: z.string().uuid({ message: 'courseId phải là UUID hợp lệ' }),
    periodCode: z
      .string()
      .min(3, 'Mã đợt tuyển sinh phải có ít nhất 3 ký tự')
      .max(50, 'Mã đợt tuyển sinh tối đa 50 ký tự'),
    name: z.string().min(5, 'Tên đợt tuyển sinh phải có ít nhất 5 ký tự'),
    startRegistration: z.string().datetime({ message: 'startRegistration phải là ISO datetime' }),
    endRegistration: z.string().datetime({ message: 'endRegistration phải là ISO datetime' }),
    expectedStartDate: z.string().datetime().optional().nullable(),
    tuitionFee: z.number().int().min(0, 'Học phí không được âm').default(0),
    maxCapacity: z.number().int().min(1, 'Sĩ số tối đa phải ít nhất là 1'),
  }),
});

export const updateEnrollmentPeriodSchema = z.object({
  body: z.object({
    name: z.string().min(5).optional(),
    startRegistration: z.string().datetime().optional(),
    endRegistration: z.string().datetime().optional(),
    expectedStartDate: z.string().datetime().optional().nullable(),
    tuitionFee: z.number().int().min(0).optional(),
    maxCapacity: z.number().int().min(1).optional(),
  }),
});

export const updatePeriodStatusSchema = z.object({
  body: z.object({
    status: z.enum(['UPCOMING', 'OPEN', 'CLOSED', 'CANCELLED'], {
      errorMap: () => ({ message: 'Trạng thái phải là UPCOMING, OPEN, CLOSED hoặc CANCELLED' }),
    }),
  }),
});

export const periodQuerySchema = z.object({
  query: z.object({
    courseId: z.string().uuid().optional(),
    status: z.enum(['UPCOMING', 'OPEN', 'CLOSED', 'CANCELLED']).optional(),
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
