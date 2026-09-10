import { z } from "zod";

const optionalDate = z.string().datetime().optional().nullable();

export const createClassSchema = z.object({
  body: z.object({
    periodId: z.string().uuid({ message: "periodId phải là UUID hợp lệ" }),
    classCode: z.string().min(2).max(50),
    name: z.string().min(2).max(150),
    room: z.string().max(100).optional().nullable(),
    scheduleDescription: z.string().max(500).optional().nullable(),
    maxStudents: z.number().int().min(1).optional(),
    teacherId: z.string().uuid().optional().nullable(),
    startDate: optionalDate,
    endDate: optionalDate,
    allocate: z.boolean().optional(),
  }),
});

export const allocateClassSchema = z.object({
  body: z.object({
    registrationIds: z.array(z.string().uuid()).min(1).optional(),
  }),
});
