import type { SupabaseClient } from "@supabase/supabase-js";
import {
  findMissingPrerequisites,
  getSingle,
  hasScheduleConflict,
  isDuplicateEnrollment,
  isSectionFull,
  type EnrollmentWithSchedule,
} from "@/lib/enrollment/rules";

export type EnrollmentApiResult = {
  status: number;
  body: Record<string, unknown>;
};

type SectionWithCourse = {
  id: string;
  term: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  capacity: number;
  course_id: string;
};

type ExistingEnrollment = {
  id: string;
  status: string;
};

type SectionScheduleRow = {
  term: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  course_id: string;
};

type EnrollmentRow = {
  id: string;
  status: "enrolled" | "dropped" | "completed";
  section_id: string;
  sections: SectionScheduleRow | SectionScheduleRow[] | null;
};

type CoursePrereqRow = {
  prerequisite_course_id: string;
};

type QueryError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

export function isMissingSchemaObjectError(error: QueryError | null) {
  if (!error) {
    return false;
  }

  // Supabase/PostgREST returns schema-cache miss codes instead of raw Postgres
  // relation/column errors when optional prerequisite objects are absent.
  if (
    error.code === "42P01" ||
    error.code === "42703" ||
    error.code === "PGRST204" ||
    error.code === "PGRST205"
  ) {
    return true;
  }

  const combined = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();

  return (
    combined.includes("schema cache") ||
    combined.includes("does not exist") ||
    combined.includes("could not find the table") ||
    combined.includes("could not find the column")
  );
}

async function getPrerequisiteCourseIds(
  supabase: SupabaseClient,
  courseId: string,
): Promise<{ ids: string[]; error: string | null }> {
  const fromMapping = await supabase
    .from("course_prerequisites")
    .select("prerequisite_course_id")
    .eq("course_id", courseId);

  if (!fromMapping.error) {
    const ids = (fromMapping.data ?? [])
      .map((row) => (row as CoursePrereqRow).prerequisite_course_id)
      .filter((value): value is string => typeof value === "string" && value.length > 0);

    return { ids, error: null };
  }

  if (!isMissingSchemaObjectError(fromMapping.error)) {
    return { ids: [], error: fromMapping.error.message };
  }

  const fromSingleColumn = await supabase
    .from("courses")
    .select("prerequisite_course_id")
    .eq("id", courseId)
    .maybeSingle<{ prerequisite_course_id: string | null }>();

  if (!fromSingleColumn.error) {
    const prerequisiteId = fromSingleColumn.data?.prerequisite_course_id;
    return { ids: prerequisiteId ? [prerequisiteId] : [], error: null };
  }

  if (!isMissingSchemaObjectError(fromSingleColumn.error)) {
    return { ids: [], error: fromSingleColumn.error.message };
  }

  const fromArrayColumn = await supabase
    .from("courses")
    .select("prerequisite_course_ids")
    .eq("id", courseId)
    .maybeSingle<{ prerequisite_course_ids: string[] | null }>();

  if (!fromArrayColumn.error) {
    return { ids: fromArrayColumn.data?.prerequisite_course_ids ?? [], error: null };
  }

  if (!isMissingSchemaObjectError(fromArrayColumn.error)) {
    return { ids: [], error: fromArrayColumn.error.message };
  }

  return { ids: [], error: null };
}

export async function enrollStudentInSection(
  supabase: SupabaseClient,
  studentId: string,
  sectionId: string,
): Promise<EnrollmentApiResult> {
  const { data: sectionRow, error: sectionError } = await supabase
    .from("sections")
    .select("id,term,day_of_week,start_time,end_time,capacity,course_id")
    .eq("id", sectionId)
    .maybeSingle<SectionWithCourse>();

  if (sectionError) {
    return {
      status: 500,
      body: { error: "section_lookup_failed", message: "Could not verify section." },
    };
  }

  if (!sectionRow) {
    return {
      status: 404,
      body: { error: "section_not_found", message: "Section does not exist." },
    };
  }

  const { data: existingEnrollment } = await supabase
    .from("enrollments")
    .select("id,status")
    .eq("student_id", studentId)
    .eq("section_id", sectionRow.id)
    .maybeSingle<ExistingEnrollment>();

  if (existingEnrollment?.id && isDuplicateEnrollment(existingEnrollment.status)) {
    return {
      status: 409,
      body: { error: "already_enrolled", message: "Student is already enrolled in this section." },
    };
  }

  const { count: enrolledCount, error: enrollmentCountError } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("section_id", sectionRow.id)
    .eq("status", "enrolled");

  if (enrollmentCountError) {
    return {
      status: 500,
      body: { error: "capacity_check_failed", message: "Could not verify section capacity." },
    };
  }

  if (isSectionFull(enrolledCount ?? 0, sectionRow.capacity)) {
    return {
      status: 409,
      body: { error: "section_full", message: "Section capacity has been reached." },
    };
  }

  const { data: activeEnrollments, error: activeEnrollmentsError } = await supabase
    .from("enrollments")
    .select("id,status,section_id,sections!inner(term,day_of_week,start_time,end_time,course_id)")
    .eq("student_id", studentId)
    .in("status", ["enrolled", "completed"]);

  if (activeEnrollmentsError) {
    return {
      status: 500,
      body: { error: "schedule_check_failed", message: "Could not check schedule conflicts." },
    };
  }

  const active = (activeEnrollments ?? []) as EnrollmentRow[];

  if (hasScheduleConflict(sectionRow, active as EnrollmentWithSchedule[])) {
    return {
      status: 409,
      body: { error: "schedule_conflict", message: "Schedule conflict with an existing enrollment." },
    };
  }

  const { ids: prerequisiteCourseIds, error: prerequisiteError } = await getPrerequisiteCourseIds(
    supabase,
    sectionRow.course_id,
  );

  if (prerequisiteError) {
    return {
      status: 500,
      body: { error: "prerequisite_check_failed", message: "Could not verify prerequisites." },
    };
  }

  if (prerequisiteCourseIds.length > 0) {
    const completedCourseIds = new Set<string>();

    for (const enrollment of active) {
      if (enrollment.status !== "completed") {
        continue;
      }

      const section = getSingle(enrollment.sections);
      const courseId = section?.course_id;
      if (courseId) {
        completedCourseIds.add(courseId);
      }
    }

    const missingPrerequisites = findMissingPrerequisites(prerequisiteCourseIds, completedCourseIds);

    if (missingPrerequisites.length > 0) {
      return {
        status: 409,
        body: {
          error: "prerequisite_not_met",
          message: "Prerequisite requirements are not satisfied.",
          missingPrerequisiteCourseIds: missingPrerequisites,
        },
      };
    }
  }

  if (existingEnrollment?.id && existingEnrollment.status === "dropped") {
    const { error: reenrollError } = await supabase
      .from("enrollments")
      .update({ status: "enrolled", enrolled_at: new Date().toISOString() })
      .eq("id", existingEnrollment.id)
      .eq("student_id", studentId);

    if (reenrollError) {
      return {
        status: 500,
        body: { error: "enrollment_failed", message: "Failed to enroll in section." },
      };
    }

    return {
      status: 200,
      body: { success: true, enrollmentId: existingEnrollment.id },
    };
  }

  const { data: enrollment, error: insertError } = await supabase
    .from("enrollments")
    .insert({
      student_id: studentId,
      section_id: sectionRow.id,
      status: "enrolled",
    })
    .select("id")
    .maybeSingle<{ id: string }>();

  if (insertError) {
    const message = insertError.message.toLowerCase();

    if (message.includes("schedule conflict")) {
      return {
        status: 409,
        body: { error: "schedule_conflict", message: "Schedule conflict with an existing enrollment." },
      };
    }

    if (insertError.code === "23505") {
      return {
        status: 409,
        body: { error: "already_enrolled", message: "Student is already enrolled in this section." },
      };
    }

    return {
      status: 500,
      body: { error: "enrollment_failed", message: "Failed to enroll in section." },
    };
  }

  return {
    status: 201,
    body: { success: true, enrollmentId: enrollment?.id ?? null },
  };
}
