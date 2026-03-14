import { z } from "zod";
import { DbUuidSchema } from "@/lib/validations/identifiers";

export const SectionIdParamSchema = z.object({
  sectionId: DbUuidSchema,
});

export const CreateGradebookItemSchema = z.object({
  sectionId: DbUuidSchema,
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional().nullable(),
  maxPoints: z.coerce.number().positive(),
  dueAt: z.string().datetime().optional().nullable(),
});

export const UpsertGradebookScoreSchema = z.object({
  itemId: DbUuidSchema,
  studentId: DbUuidSchema,
  score: z.coerce.number().min(0),
  feedback: z.string().trim().max(2000).optional().nullable(),
});

export const UpsertGradebookScoresBatchSchema = z.object({
  scores: z.array(UpsertGradebookScoreSchema).min(1).max(500),
});
