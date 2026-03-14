import { createClient } from "@/lib/supabase/server";
import { requireStudentContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/http";
import { getStudentTranscriptAggregate } from "@/lib/api/transcripts";
import { StudentMeResponseSchema } from "@/lib/validations/dashboard-api";

type UserRow = {
  id: string;
  email: string;
  full_name: string;
};

type StudentRow = {
  id: string;
  user_id: string;
  student_number: string;
  program_name: string | null;
  enrollment_year: number | null;
};

export async function GET() {
  const supabase = await createClient();
  const { data: studentContext, error: authError } = await requireStudentContext(supabase);

  if (authError || !studentContext) {
    return errorResponse(
      authError?.status ?? 403,
      authError?.error ?? "forbidden",
      authError?.message ?? "Student role is required.",
    );
  }

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("id,email,full_name")
    .eq("id", studentContext.userId)
    .maybeSingle<UserRow>();

  if (userError || !userRow) {
    return errorResponse(500, "user_lookup_failed", "Could not load user profile.");
  }

  const { data: studentRow, error: studentError } = await supabase
    .from("students")
    .select("id,user_id,student_number,program_name,enrollment_year")
    .eq("id", studentContext.studentId)
    .maybeSingle<StudentRow>();

  if (studentError || !studentRow) {
    return errorResponse(500, "student_lookup_failed", "Could not load student profile.");
  }

  const { data: transcriptData, error: transcriptError } = await getStudentTranscriptAggregate(
    supabase,
    studentContext.studentId,
  );

  if (transcriptError || !transcriptData) {
    return errorResponse(500, "transcript_lookup_failed", transcriptError ?? "Could not load transcript summary.");
  }

  const payload = {
    student: {
      id: studentRow.id,
      userId: studentRow.user_id,
      email: userRow.email,
      fullName: userRow.full_name,
      studentNumber: studentRow.student_number,
      programName: studentRow.program_name,
      enrollmentYear: studentRow.enrollment_year,
    },
    summary: {
      enrolledSections: transcriptData.courses.filter((course) => course.status === "enrolled").length,
      completedSections: transcriptData.courses.filter((course) => course.status === "completed").length,
      creditsAttempted: transcriptData.credits_attempted,
      creditsCompleted: transcriptData.credits_completed,
      gpa: transcriptData.gpa,
    },
  };

  const parsed = StudentMeResponseSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(500, "invalid_response", "Student profile response validation failed.");
  }

  return successResponse(200, parsed.data);
}
