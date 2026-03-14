import { createClient } from "@/lib/supabase/server";
import { requireStudentContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/http";
import { getStudentTranscriptAggregate } from "@/lib/api/transcripts";
import { TranscriptMeResponseSchema } from "@/lib/validations/dashboard-api";

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

  const { data, error } = await getStudentTranscriptAggregate(supabase, studentContext.studentId);

  if (error || !data) {
    return errorResponse(500, "transcript_lookup_failed", error ?? "Could not load transcript data.");
  }

  const parsed = TranscriptMeResponseSchema.safeParse(data);
  if (!parsed.success) {
    return errorResponse(500, "invalid_response", "Transcript response validation failed.");
  }

  return successResponse(200, parsed.data);
}
