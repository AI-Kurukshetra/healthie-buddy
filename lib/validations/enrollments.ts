import { z } from "zod";

export const CreateEnrollmentSchema = z.object({
  sectionId: z.string().uuid(),
});

export const CourseIdParamSchema = z.object({
  id: z.string().uuid(),
});
