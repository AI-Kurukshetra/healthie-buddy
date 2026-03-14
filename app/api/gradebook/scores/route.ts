import { createClient } from "@/lib/supabase/server";
import { requireFacultyContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/http";
import {
  UpsertGradebookScoreSchema,
  UpsertGradebookScoresBatchSchema,
} from "@/lib/validations/gradebook";
import type { z } from "zod";

type ItemOwnershipRow = {
  id: string;
  max_points: number;
  section_id: string;
};

type EnrollmentRow = {
  id: string;
};

type ScoreResponse = {
  id: string | null;
  itemId: string;
  studentId: string;
  score: number;
  feedback: string | null;
  gradedAt: string;
};

type UpsertGradebookScoreInput = z.infer<typeof UpsertGradebookScoreSchema>;

async function upsertScore(
  supabase: Awaited<ReturnType<typeof createClient>>,
  facultyId: string,
  input: UpsertGradebookScoreInput,
): Promise<{ data: ScoreResponse | null; error: { status: number; code: string; message: string } | null }> {
  const { data: itemRow, error: itemError } = await supabase
    .from("gradebook_items")
    .select("id,max_points,section_id,sections!inner(faculty_id)")
    .eq("id", input.itemId)
    .eq("sections.faculty_id", facultyId)
    .maybeSingle<ItemOwnershipRow>();

  if (itemError) {
    return {
      data: null,
      error: { status: 500, code: "item_lookup_failed", message: "Could not verify gradebook item." },
    };
  }

  if (!itemRow) {
    return {
      data: null,
      error: { status: 403, code: "forbidden", message: "You can only score items in your own sections." },
    };
  }

  if (input.score > itemRow.max_points) {
    return {
      data: null,
      error: { status: 400, code: "invalid_score", message: "Score cannot exceed max points." },
    };
  }

  const { data: enrollmentRow, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("section_id", itemRow.section_id)
    .eq("student_id", input.studentId)
    .in("status", ["enrolled", "completed"])
    .maybeSingle<EnrollmentRow>();

  if (enrollmentError) {
    return {
      data: null,
      error: { status: 500, code: "enrollment_lookup_failed", message: "Could not verify student enrollment." },
    };
  }

  if (!enrollmentRow) {
    return {
      data: null,
      error: { status: 400, code: "student_not_in_section", message: "Student is not enrolled in this section." },
    };
  }

  const nowIso = new Date().toISOString();
  const { data: scoreRow, error: scoreError } = await supabase
    .from("gradebook_scores")
    .upsert(
      {
        item_id: input.itemId,
        student_id: input.studentId,
        score: input.score,
        feedback: input.feedback ?? null,
        graded_at: nowIso,
      },
      { onConflict: "item_id,student_id" },
    )
    .select("id,item_id,student_id,score,feedback,graded_at")
    .maybeSingle<{
      id: string;
      item_id: string;
      student_id: string;
      score: number;
      feedback: string | null;
      graded_at: string;
    }>();

  if (scoreError) {
    return {
      data: null,
      error: { status: 500, code: "score_upsert_failed", message: "Could not save gradebook score." },
    };
  }

  return {
    data: {
      id: scoreRow?.id ?? null,
      itemId: scoreRow?.item_id ?? input.itemId,
      studentId: scoreRow?.student_id ?? input.studentId,
      score: scoreRow?.score ?? input.score,
      feedback: scoreRow?.feedback ?? input.feedback ?? null,
      gradedAt: scoreRow?.graded_at ?? nowIso,
    },
    error: null,
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedBatch = UpsertGradebookScoresBatchSchema.safeParse(body);
  const parsedSingle = parsedBatch.success ? null : UpsertGradebookScoreSchema.safeParse(body);
  const singleScoreInput = parsedSingle?.success ? parsedSingle.data : null;

  if (!parsedBatch.success && !singleScoreInput) {
    return errorResponse(400, "invalid_input", "Invalid gradebook score payload.");
  }

  const supabase = await createClient();
  const { data: facultyContext, error: authError } = await requireFacultyContext(supabase);

  if (authError || !facultyContext) {
    return errorResponse(
      authError?.status ?? 403,
      authError?.error ?? "forbidden",
      authError?.message ?? "Faculty role is required.",
    );
  }

  const payloadScores = parsedBatch.success
    ? parsedBatch.data.scores
    : singleScoreInput
      ? [singleScoreInput]
      : [];
  const savedScores: ScoreResponse[] = [];

  for (const scoreInput of payloadScores) {
    const result = await upsertScore(supabase, facultyContext.facultyId, scoreInput);

    if (result.error || !result.data) {
      return errorResponse(
        result.error?.status ?? 500,
        result.error?.code ?? "score_upsert_failed",
        result.error?.message ?? "Could not save gradebook score.",
      );
    }

    savedScores.push(result.data);
  }

  return successResponse(200, {
    scores: savedScores,
  });
}
