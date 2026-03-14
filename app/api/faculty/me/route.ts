import { createClient } from "@/lib/supabase/server";
import { requireFacultyContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/http";
import { FacultyMeResponseSchema } from "@/lib/validations/dashboard-api";

type UserRow = {
  id: string;
  email: string;
  full_name: string;
};

type FacultyRow = {
  id: string;
  user_id: string;
  employee_number: string;
  department_name: string | null;
};

type SectionRow = {
  id: string;
};

type EnrollmentCountRow = {
  section_id: string;
};

type GradebookItemRow = {
  id: string;
};

type GradebookScoreRow = {
  id: string;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function GET() {
  const supabase = await createClient();
  const { data: facultyContext, error: authError } = await requireFacultyContext(supabase);

  if (authError || !facultyContext) {
    return errorResponse(
      authError?.status ?? 403,
      authError?.error ?? "forbidden",
      authError?.message ?? "Faculty role is required.",
    );
  }

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("id,email,full_name")
    .eq("id", facultyContext.userId)
    .maybeSingle<UserRow>();

  if (userError || !userRow) {
    return errorResponse(500, "user_lookup_failed", "Could not load user profile.");
  }

  const { data: facultyRow, error: facultyError } = await supabase
    .from("faculty")
    .select("id,user_id,employee_number,department_name")
    .eq("id", facultyContext.facultyId)
    .maybeSingle<FacultyRow>();

  if (facultyError || !facultyRow) {
    return errorResponse(500, "faculty_lookup_failed", "Could not load faculty profile.");
  }

  const { data: sectionRows, error: sectionError } = await supabase
    .from("sections")
    .select("id")
    .eq("faculty_id", facultyContext.facultyId);

  if (sectionError) {
    return errorResponse(500, "sections_lookup_failed", "Could not load faculty sections.");
  }

  const sections = (sectionRows ?? []) as SectionRow[];
  const sectionIds = sections.map((section) => section.id);

  const { data: enrollmentRows, error: enrollmentError } = sectionIds.length
    ? await supabase
        .from("enrollments")
        .select("section_id")
        .in("section_id", sectionIds)
        .in("status", ["enrolled", "completed"])
    : { data: [], error: null };

  if (enrollmentError) {
    return errorResponse(500, "enrollments_lookup_failed", "Could not load enrollment totals.");
  }

  const { data: itemRows, error: itemError } = sectionIds.length
    ? await supabase
        .from("gradebook_items")
        .select("id")
        .in("section_id", sectionIds)
    : { data: [], error: null };

  if (itemError) {
    return errorResponse(500, "gradebook_items_lookup_failed", "Could not load gradebook item totals.");
  }

  const itemIds = ((itemRows ?? []) as GradebookItemRow[]).map((item) => item.id);

  const { data: scoreRows, error: scoreError } = itemIds.length
    ? await supabase
        .from("gradebook_scores")
        .select("id")
        .in("item_id", itemIds)
    : { data: [], error: null };

  if (scoreError) {
    return errorResponse(500, "gradebook_scores_lookup_failed", "Could not load gradebook score totals.");
  }

  const enrolledStudents = ((enrollmentRows ?? []) as EnrollmentCountRow[]).length;
  const gradebookItems = ((itemRows ?? []) as GradebookItemRow[]).length;
  const scoredCells = ((scoreRows ?? []) as GradebookScoreRow[]).length;
  const expectedCells = enrolledStudents * gradebookItems;
  const completionPercent = expectedCells > 0 ? round2(Math.min((scoredCells / expectedCells) * 100, 100)) : 0;

  const payload = {
    faculty: {
      id: facultyRow.id,
      userId: facultyRow.user_id,
      email: userRow.email,
      fullName: userRow.full_name,
      employeeNumber: facultyRow.employee_number,
      departmentName: facultyRow.department_name,
    },
    summary: {
      assignedSections: sections.length,
      enrolledStudents,
      gradebookItems,
      scoredCells,
      completionPercent,
    },
  };

  const parsed = FacultyMeResponseSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse(500, "invalid_response", "Faculty profile response validation failed.");
  }

  return successResponse(200, parsed.data);
}
