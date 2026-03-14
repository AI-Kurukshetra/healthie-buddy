import { createClient } from "@/lib/supabase/server";
import { requireAuthenticatedContext, requireFacultyContext, requireStudentContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/http";
import { getFacultyGrades, getStudentGrades } from "@/lib/api/grades";
import { FacultyGradesResponseSchema, StudentGradesResponseSchema } from "@/lib/validations/dashboard-api";

export async function GET() {
  const supabase = await createClient();
  const { data: authContext, error: authError } = await requireAuthenticatedContext(supabase);

  if (authError || !authContext) {
    return errorResponse(authError?.status ?? 401, authError?.error ?? "unauthenticated", authError?.message ?? "You must be signed in.");
  }

  if (authContext.role === "student") {
    const { data: studentContext, error: studentError } = await requireStudentContext(supabase);

    if (studentError || !studentContext) {
      return errorResponse(
        studentError?.status ?? 403,
        studentError?.error ?? "forbidden",
        studentError?.message ?? "Student role is required.",
      );
    }

    const { data, error } = await getStudentGrades(supabase, studentContext.studentId);

    if (error || !data) {
      return errorResponse(500, "grades_lookup_failed", error ?? "Could not load grades.");
    }

    const parsed = StudentGradesResponseSchema.safeParse(data);
    if (!parsed.success) {
      return errorResponse(500, "invalid_response", "Grades response validation failed.");
    }

    return successResponse(200, parsed.data);
  }

  if (authContext.role === "faculty") {
    const { data: facultyContext, error: facultyError } = await requireFacultyContext(supabase);

    if (facultyError || !facultyContext) {
      return errorResponse(
        facultyError?.status ?? 403,
        facultyError?.error ?? "forbidden",
        facultyError?.message ?? "Faculty role is required.",
      );
    }

    const { data, error } = await getFacultyGrades(supabase, facultyContext.facultyId);

    if (error || !data) {
      return errorResponse(500, "grades_lookup_failed", error ?? "Could not load grades.");
    }

    const parsed = FacultyGradesResponseSchema.safeParse(data);
    if (!parsed.success) {
      return errorResponse(500, "invalid_response", "Grades response validation failed.");
    }

    return successResponse(200, parsed.data);
  }

  return errorResponse(403, "forbidden", "Grades endpoint is available only to student and faculty roles.");
}
