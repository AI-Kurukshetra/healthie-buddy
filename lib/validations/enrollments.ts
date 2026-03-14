import { z } from "zod";
import { DbUuidSchema } from "@/lib/validations/identifiers";

export const CreateEnrollmentSchema = z.object({
  sectionId: DbUuidSchema,
});

export const CourseIdParamSchema = z.object({
  id: DbUuidSchema,
});
