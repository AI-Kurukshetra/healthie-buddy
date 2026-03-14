import { createClient } from "@/lib/supabase/server";
import { requireStudentContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/http";
import { CreateEnrollmentSchema } from "@/lib/validations/enrollments";
import { enrollStudentInSection } from "@/lib/api/enrollments";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = CreateEnrollmentSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(400, "invalid_input", "Expected payload: { sectionId: uuid }.");
  }

  const supabase = await createClient();
  const { data: studentContext, error: authError } = await requireStudentContext(supabase);

  if (authError || !studentContext) {
    return errorResponse(authError?.status ?? 403, authError?.error ?? "forbidden", authError?.message ?? "Student role is required.");
  }

  const result = await enrollStudentInSection(supabase, studentContext.studentId, parsed.data.sectionId);
  return successResponse(result.status, result.body);
}
