import { createClient } from "@/lib/supabase/server";
import { requireAuthenticatedContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/http";
import { CourseSectionsResponseSchema } from "@/lib/validations/api-contracts";
import { CourseIdParamSchema } from "@/lib/validations/enrollments";

type CourseRow = {
  id: string;
  code: string;
  title: string;
};

type SectionRow = {
  id: string;
  term: string;
  section_code: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  capacity: number;
  faculty:
    | {
        users:
          | {
              full_name: string | null;
            }
          | {
              full_name: string | null;
            }[]
          | null;
      }
    | {
        users:
          | {
              full_name: string | null;
            }
          | {
              full_name: string | null;
            }[]
          | null;
      }[]
    | null;
};

function getSingle<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const parsedParams = CourseIdParamSchema.safeParse(resolvedParams);

  if (!parsedParams.success) {
    return errorResponse(400, "invalid_input", "Course id must be a valid uuid.");
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

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id,code,title")
    .eq("id", parsedParams.data.id)
    .maybeSingle<CourseRow>();

  if (courseError) {
    return errorResponse(500, "course_lookup_failed", "Could not verify course.");
  }

  if (!course) {
    return errorResponse(404, "course_not_found", "Course does not exist.");
  }

  const { data: sectionRows, error: sectionsError } = await supabase
    .from("sections")
    .select("id,term,section_code,day_of_week,start_time,end_time,room,capacity,faculty:faculty_id(users:user_id(full_name))")
    .eq("course_id", parsedParams.data.id)
    .order("term", { ascending: true })
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (sectionsError) {
    return errorResponse(500, "sections_lookup_failed", "Could not fetch course sections.");
  }

  const sections = ((sectionRows ?? []) as SectionRow[]).map((section) => {
    const faculty = getSingle(section.faculty);
    const user = getSingle(faculty?.users ?? null);

    return {
      id: section.id,
      term: section.term,
      sectionCode: section.section_code,
      dayOfWeek: section.day_of_week,
      startTime: section.start_time,
      endTime: section.end_time,
      room: section.room,
      capacity: section.capacity,
      instructorName: user?.full_name ?? null,
    };
  });

  const payload = {
    course,
    sections,
  };
  const parsed = CourseSectionsResponseSchema.safeParse(payload);

  if (!parsed.success) {
    return errorResponse(500, "invalid_response", "Course sections response validation failed.");
  }

  return successResponse(200, parsed.data);
}
