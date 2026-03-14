import { z } from "zod";

export const StudentMeResponseSchema = z.object({
  student: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    email: z.string().email(),
    fullName: z.string(),
    studentNumber: z.string(),
    programName: z.string().nullable(),
    enrollmentYear: z.number().int().nullable(),
  }),
  summary: z.object({
    enrolledSections: z.number().int().nonnegative(),
    completedSections: z.number().int().nonnegative(),
    creditsAttempted: z.number().nonnegative(),
    creditsCompleted: z.number().nonnegative(),
    gpa: z.number().nonnegative(),
  }),
});

export const FacultyMeResponseSchema = z.object({
  faculty: z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    email: z.string().email(),
    fullName: z.string(),
    employeeNumber: z.string(),
    departmentName: z.string().nullable(),
  }),
  summary: z.object({
    assignedSections: z.number().int().nonnegative(),
    enrolledStudents: z.number().int().nonnegative(),
    gradebookItems: z.number().int().nonnegative(),
    scoredCells: z.number().int().nonnegative(),
    completionPercent: z.number().min(0).max(100),
  }),
});

export const GradeBreakdownItemSchema = z.object({
  itemId: z.string().uuid(),
  title: z.string(),
  maxPoints: z.number().nonnegative(),
  score: z.number().nonnegative().nullable(),
  percentage: z.number().nonnegative().nullable(),
});

export const GradeRecordSchema = z.object({
  enrollmentId: z.string().uuid(),
  sectionId: z.string().uuid(),
  sectionCode: z.string(),
  term: z.string(),
  status: z.enum(["enrolled", "completed"]),
  courseId: z.string().uuid(),
  courseCode: z.string(),
  courseTitle: z.string(),
  credits: z.number().nonnegative(),
  finalGrade: z.string().nullable(),
  gradePoints: z.number().nonnegative().nullable(),
  weightedPercentage: z.number().nonnegative().nullable(),
  breakdown: z.array(GradeBreakdownItemSchema),
});

export const StudentGradesResponseSchema = z.object({
  role: z.literal("student"),
  grades: z.array(GradeRecordSchema),
});

export const FacultyGradesResponseSchema = z.object({
  role: z.literal("faculty"),
  grades: z.array(
    GradeRecordSchema.extend({
      student: z.object({
        id: z.string().uuid(),
        studentNumber: z.string(),
        fullName: z.string(),
        email: z.string().email(),
      }),
    }),
  ),
});

export const TranscriptCourseResponseSchema = z.object({
  enrollmentId: z.string().uuid(),
  sectionId: z.string().uuid(),
  sectionCode: z.string(),
  status: z.enum(["enrolled", "completed"]),
  term: z.string(),
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string(),
  endTime: z.string(),
  room: z.string().nullable(),
  courseId: z.string().uuid(),
  courseCode: z.string(),
  courseTitle: z.string(),
  credits: z.number().nonnegative(),
  weightedPercentage: z.number().nonnegative().nullable(),
  finalGrade: z.string().nullable(),
  gradePoints: z.number().nonnegative().nullable(),
  hasGradebookItems: z.boolean(),
  breakdown: z.array(GradeBreakdownItemSchema),
});

export const TranscriptMeResponseSchema = z.object({
  courses: z.array(TranscriptCourseResponseSchema),
  credits_attempted: z.number().nonnegative(),
  credits_completed: z.number().nonnegative(),
  gpa: z.number().nonnegative(),
});
