import { z } from "zod";

const attendanceStatus = z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]);

export const generateSessionsSchema = z.object({
  body: z.object({
    weekdays: z.array(z.number().int().min(1).max(7)).min(1).max(7),
    sessionCount: z.number().int().min(1).max(200),
    startDate: z.string().datetime().optional(),
    topicPrefix: z.string().max(200).optional().nullable(),
  }),
});

export const saveAttendanceSchema = z.object({
  body: z.object({
    attendances: z
      .array(
        z.object({
          enrollmentId: z.string().uuid(),
          status: attendanceStatus,
          note: z.string().max(500).optional().nullable(),
        }),
      )
      .min(1),
  }),
});
