import { z } from "zod";
import { DbUuidSchema } from "@/lib/validations/identifiers";

const ApiDateTimeSchema = z.string().datetime({ offset: true });
const ApiNonNegativeNumberSchema = z.coerce.number().nonnegative();
const ApiPositiveNumberSchema = z.coerce.number().positive();

export const ApiErrorBodySchema = z.object({
  error: z.string(),
  message: z.string(),
});

export const CourseSchema = z.object({
  id: DbUuidSchema,
  code: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  credits: ApiNonNegativeNumberSchema,
});

export const CoursesResponseSchema = z.object({
  courses: z.array(CourseSchema),
});

export const CourseSummarySchema = z.object({
  id: DbUuidSchema,
  code: z.string(),
  title: z.string(),
});

export const CourseSectionSchema = z.object({
  id: DbUuidSchema,
  term: z.string(),
  sectionCode: z.string(),
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string(),
  endTime: z.string(),
  room: z.string().nullable(),
  capacity: z.number().int().positive(),
  instructorName: z.string().nullable(),
});

export const CourseSectionsResponseSchema = z.object({
  course: CourseSummarySchema,
  sections: z.array(CourseSectionSchema),
});

export const EnrollmentMutationResponseSchema = z.union([
  z.object({
    success: z.literal(true),
    enrollmentId: DbUuidSchema,
  }),
  ApiErrorBodySchema.extend({
    missingPrerequisiteCourseIds: z.array(DbUuidSchema).optional(),
  }),
]);

export const EnrollmentCourseSchema = z.object({
  id: DbUuidSchema,
  code: z.string(),
  title: z.string(),
  credits: ApiNonNegativeNumberSchema,
});

export const EnrollmentSectionSchema = z.object({
  id: DbUuidSchema,
  term: z.string(),
  sectionCode: z.string(),
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string(),
  endTime: z.string(),
  room: z.string().nullable(),
  course: EnrollmentCourseSchema,
});

export const EnrollmentRecordSchema = z.object({
  id: DbUuidSchema,
  status: z.enum(["enrolled", "completed", "dropped"]),
  enrolledAt: ApiDateTimeSchema,
  section: EnrollmentSectionSchema,
});

export const MyEnrollmentsResponseSchema = z.object({
  enrollments: z.array(EnrollmentRecordSchema),
});

export const GradebookItemResponseSchema = z.object({
  id: DbUuidSchema.nullable(),
  sectionId: DbUuidSchema,
  title: z.string(),
  description: z.string().nullable(),
  maxPoints: ApiPositiveNumberSchema,
  dueAt: ApiDateTimeSchema.nullable(),
});

export const CreateGradebookItemResponseSchema = z.object({
  item: GradebookItemResponseSchema,
});

export const GradebookScoreResponseSchema = z.object({
  id: DbUuidSchema.nullable(),
  itemId: DbUuidSchema,
  studentId: DbUuidSchema,
  score: ApiNonNegativeNumberSchema,
  feedback: z.string().nullable(),
  gradedAt: ApiDateTimeSchema,
});

export const GradebookScoresResponseSchema = z.object({
  scores: z.array(GradebookScoreResponseSchema),
});

export const GradebookSectionResponseSchema = z.object({
  id: DbUuidSchema,
  term: z.string(),
  sectionCode: z.string(),
  course: z.object({
    id: DbUuidSchema.nullable(),
    code: z.string(),
    title: z.string(),
  }),
});

export const GradebookStudentResponseSchema = z.object({
  id: DbUuidSchema,
  studentNumber: z.string(),
  fullName: z.string(),
  email: z.string().email(),
});

export const FacultySectionGradebookResponseSchema = z.object({
  role: z.literal("faculty"),
  section: GradebookSectionResponseSchema,
  items: z.array(GradebookItemResponseSchema),
  students: z.array(GradebookStudentResponseSchema),
  scores: z.array(GradebookScoreResponseSchema),
});

export const StudentSectionGradebookResponseSchema = z.object({
  role: z.literal("student"),
  section: GradebookSectionResponseSchema,
  items: z.array(GradebookItemResponseSchema),
  scores: z.array(GradebookScoreResponseSchema),
});

export const SectionGradebookResponseSchema = z.discriminatedUnion("role", [
  FacultySectionGradebookResponseSchema,
  StudentSectionGradebookResponseSchema,
]);
