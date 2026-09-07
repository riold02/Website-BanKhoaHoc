import { z } from 'zod';

export const createCourseSchema = z.object({
  body: z.object({
    courseCode: z
      .string()
      .min(2, 'Mã khóa học phải có ít nhất 2 ký tự')
      .max(20, 'Mã khóa học tối đa 20 ký tự')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Mã khóa học chỉ gồm chữ cái, số, gạch nối'),
    title: z.string().min(3, 'Tên khóa học phải có ít nhất 3 ký tự'),
    description: z.string().optional(),
    totalHours: z.number().int().positive('Thời lượng phải lớn hơn 0'),
    standardPrice: z.number().int().nonnegative('Học phí không được âm'),
    categoryId: z.string().uuid('Category ID không hợp lệ').optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Course ID không hợp lệ'),
  }),
  body: z.object({
    courseCode: z.string().min(2).max(20).optional(),
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    totalHours: z.number().int().positive().optional(),
    standardPrice: z.number().int().nonnegative().optional(),
    categoryId: z.string().uuid().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const courseQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    isActive: z.string().optional(),
  }),
});
