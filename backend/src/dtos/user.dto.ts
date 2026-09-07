import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('User ID không hợp lệ'),
  }),
  body: z.object({
    isActive: z.boolean({ required_error: 'Trạng thái isActive là bắt buộc' }),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid('User ID không hợp lệ'),
  }),
  body: z.object({
    roleId: z.number().int().min(1).max(3),
  }),
});

export const listUsersQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    roleId: z.string().optional(),
    isActive: z.string().optional(),
  }),
});
