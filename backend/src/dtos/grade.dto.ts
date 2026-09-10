import { z } from "zod";

const gradeComponentInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  weight: z.number().min(0).max(1),
});

export const configureGradeComponentsSchema = z.object({
  body: z.object({
    components: z.array(gradeComponentInput).min(1),
  }),
});

const gradeInput = z.object({
  componentId: z.string().uuid(),
  score: z.number().min(0).max(10),
  feedback: z.string().max(500).optional().nullable(),
});

export const saveGradesSchema = z.object({
  body: z.object({
    grades: z.array(gradeInput).min(1),
  }),
});
