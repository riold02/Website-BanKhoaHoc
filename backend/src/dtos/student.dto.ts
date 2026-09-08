import { z } from 'zod';

export const updateStudentSchema = z.object({
  body: z.object({
    idCardNumber: z.string().max(20).optional().nullable(),
    birthDate: z.string().datetime().optional().nullable(),
    gender: z.string().max(20).optional().nullable(),
    educationLevel: z.string().max(100).optional().nullable(),
  }),
});

export const studentQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
