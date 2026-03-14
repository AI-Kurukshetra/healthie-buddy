import { createClient } from "@/lib/supabase/server";
import { requireAuthenticatedContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/http";
import { SectionGradebookResponseSchema } from "@/lib/validations/api-contracts";
import { SectionIdParamSchema } from "@/lib/validations/gradebook";

type SectionRow = {
  id: string;
  term: string;
  section_code: string;
  faculty_id: string;
  courses:
    | {
        id: string;
        code: string;
        title: string;
      }
    | {
        id: string;
        code: string;
        title: string;
      }[]
    | null;
};

type StudentRow = {
  id: string;
  user_id: string;
  student_number: string;
  users:
    | {
        full_name: string;
        email: string;
      }
    | {
        full_name: string;
        email: string;
      }[]
    | null;
};

type GradebookItemRow = {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  max_points: number;
  due_at: string | null;
};

type GradebookScoreRow = {
  id: string;
  item_id: string;
  student_id: string;
  score: number;
  feedback: string | null;
  graded_at: string;
};

type FacultyRow = {
  id: string;
};

type StudentProfileRow = {
  id: string;
};

function getSingle<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function GET(_: Request, { params }: { params: Promise<{ sectionId: string }> }) {
  const resolvedParams = await params;
  const parsedParams = SectionIdParamSchema.safeParse(resolvedParams);

  if (!parsedParams.success) {
    return errorResponse(400, "invalid_input", "Section id must be a valid uuid.");
  }

  const supabase = await createClient();
  const { data: authContext, error: authError } = await requireAuthenticatedContext(supabase);

  if (authError || !authContext) {
    return errorResponse(
      authError?.status ?? 401,
      authError?.error ?? "unauthenticated",
      authError?.message ?? "You must be signed in.",
    );
  }

  const sectionId = parsedParams.data.sectionId;

  const { data: sectionRow, error: sectionError } = await supabase
    .from("sections")
    .select("id,term,section_code,faculty_id,courses!inner(id,code,title)")
    .eq("id", sectionId)
    .maybeSingle<SectionRow>();

  if (sectionError) {
    return errorResponse(500, "section_lookup_failed", "Could not load section.");
  }

  if (!sectionRow) {
    return errorResponse(404, "section_not_found", "Section does not exist.");
  }

  const course = getSingle(sectionRow.courses);

  const { data: itemRows, error: itemError } = await supabase
    .from("gradebook_items")
    .select("id,section_id,title,description,max_points,due_at")
    .eq("section_id", sectionId)
    .order("created_at", { ascending: true });

  if (itemError) {
    return errorResponse(500, "gradebook_items_lookup_failed", "Could not load gradebook items.");
  }

  const items = (itemRows ?? []) as GradebookItemRow[];
  const itemIds = items.map((item) => item.id);

  if (authContext.role === "faculty") {
    const { data: facultyRow } = await supabase
      .from("faculty")
      .select("id")
      .eq("user_id", authContext.userId)
      .maybeSingle<FacultyRow>();

    if (!facultyRow?.id || facultyRow.id !== sectionRow.faculty_id) {
      return errorResponse(403, "forbidden", "You can only access gradebooks for your own sections.");
    }

    const { data: enrollmentRows, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("status,students!inner(id,user_id,student_number,users!inner(full_name,email))")
      .eq("section_id", sectionId)
      .in("status", ["enrolled", "completed"])
      .order("created_at", { ascending: true });

    if (enrollmentError) {
      return errorResponse(500, "students_lookup_failed", "Could not load section enrollments.");
    }

    const students = (enrollmentRows ?? [])
      .map((row) => getSingle((row.students ?? null) as StudentRow | StudentRow[] | null))
      .filter((row): row is StudentRow => Boolean(row?.id))
      .map((student) => {
        const user = getSingle(student.users);

        return {
          id: student.id,
          studentNumber: student.student_number,
          fullName: user?.full_name ?? "Unknown",
          email: user?.email ?? "",
        };
      });

    const { data: scoreRows, error: scoreError } = itemIds.length
      ? await supabase
          .from("gradebook_scores")
          .select("id,item_id,student_id,score,feedback,graded_at")
          .in("item_id", itemIds)
      : { data: [], error: null };

    if (scoreError) {
      return errorResponse(500, "scores_lookup_failed", "Could not load gradebook scores.");
    }

    const payload = {
      role: authContext.role,
      section: {
        id: sectionRow.id,
        term: sectionRow.term,
        sectionCode: sectionRow.section_code,
        course: {
          id: course?.id ?? null,
          code: course?.code ?? "",
          title: course?.title ?? "",
        },
      },
      items: items.map((item) => ({
        id: item.id,
        sectionId: item.section_id,
        title: item.title,
        description: item.description,
        maxPoints: item.max_points,
        dueAt: item.due_at,
      })),
      students,
      scores: ((scoreRows ?? []) as GradebookScoreRow[]).map((score) => ({
        id: score.id,
        itemId: score.item_id,
        studentId: score.student_id,
        score: score.score,
        feedback: score.feedback,
        gradedAt: score.graded_at,
      })),
    };
    const parsed = SectionGradebookResponseSchema.safeParse(payload);

    if (!parsed.success) {
      console.error("GET /api/sections/[sectionId]/gradebook invalid faculty response", parsed.error.issues);
      return errorResponse(500, "invalid_response", "Faculty gradebook response validation failed.");
    }

    return successResponse(200, parsed.data);
  }

  if (authContext.role === "student") {
    const { data: studentRow, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", authContext.userId)
      .maybeSingle<StudentProfileRow>();

    if (studentError || !studentRow?.id) {
      return errorResponse(403, "forbidden", "Student profile is missing.");
    }

    const { data: enrollmentRow, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("section_id", sectionId)
      .eq("student_id", studentRow.id)
      .in("status", ["enrolled", "completed"])
      .maybeSingle<{ id: string }>();

    if (enrollmentError) {
      return errorResponse(500, "enrollment_lookup_failed", "Could not verify enrollment.");
    }

    if (!enrollmentRow?.id) {
      return errorResponse(403, "forbidden", "You can only read scores for your enrolled sections.");
    }

    const { data: scoreRows, error: scoreError } = itemIds.length
      ? await supabase
          .from("gradebook_scores")
          .select("id,item_id,student_id,score,feedback,graded_at")
          .eq("student_id", studentRow.id)
          .in("item_id", itemIds)
      : { data: [], error: null };

    if (scoreError) {
      return errorResponse(500, "scores_lookup_failed", "Could not load your scores.");
    }

    const payload = {
      role: authContext.role,
      section: {
        id: sectionRow.id,
        term: sectionRow.term,
        sectionCode: sectionRow.section_code,
        course: {
          id: course?.id ?? null,
          code: course?.code ?? "",
          title: course?.title ?? "",
        },
      },
      items: items.map((item) => ({
        id: item.id,
        sectionId: item.section_id,
        title: item.title,
        description: item.description,
        maxPoints: item.max_points,
        dueAt: item.due_at,
      })),
      scores: ((scoreRows ?? []) as GradebookScoreRow[]).map((score) => ({
        id: score.id,
        itemId: score.item_id,
        studentId: score.student_id,
        score: score.score,
        feedback: score.feedback,
        gradedAt: score.graded_at,
      })),
    };
    const parsed = SectionGradebookResponseSchema.safeParse(payload);

    if (!parsed.success) {
      console.error("GET /api/sections/[sectionId]/gradebook invalid student response", parsed.error.issues);
      return errorResponse(500, "invalid_response", "Student gradebook response validation failed.");
    }

    return successResponse(200, parsed.data);
  }

  return errorResponse(403, "forbidden", "Unsupported role for gradebook access.");
}
