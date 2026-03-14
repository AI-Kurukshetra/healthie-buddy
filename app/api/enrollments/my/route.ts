import { createClient } from "@/lib/supabase/server";
import { requireStudentContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/http";
import { MyEnrollmentsResponseSchema } from "@/lib/validations/api-contracts";

type EnrollmentViewRow = {
  id: string;
  status: "enrolled" | "completed" | "dropped";
  enrolled_at: string;
  sections:
    | {
        id: string;
        term: string;
        section_code: string;
        day_of_week: number;
        start_time: string;
        end_time: string;
        room: string | null;
        courses:
          | {
              id: string;
              code: string;
              title: string;
              credits: number | string;
            }
          | {
              id: string;
              code: string;
              title: string;
              credits: number | string;
            }[]
          | null;
      }
    | {
        id: string;
        term: string;
        section_code: string;
        day_of_week: number;
        start_time: string;
        end_time: string;
        room: string | null;
        courses:
          | {
              id: string;
              code: string;
              title: string;
              credits: number | string;
            }
          | {
              id: string;
              code: string;
              title: string;
              credits: number | string;
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

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      "id,status,enrolled_at,sections!inner(id,term,section_code,day_of_week,start_time,end_time,room,courses!inner(id,code,title,credits))",
    )
    .eq("student_id", studentContext.studentId)
    .order("enrolled_at", { ascending: false });

  if (error) {
    return errorResponse(500, "enrollments_lookup_failed", "Could not fetch student enrollments.");
  }

  const enrollments = ((data ?? []) as EnrollmentViewRow[]).flatMap((enrollment) => {
    const section = getSingle(enrollment.sections);
    const course = getSingle(section?.courses ?? null);

    if (!section?.id || !course?.id) {
      return [];
    }

    return [
      {
        id: enrollment.id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolled_at,
        section: {
          id: section.id,
          term: section.term,
          sectionCode: section.section_code,
          dayOfWeek: section.day_of_week,
          startTime: section.start_time,
          endTime: section.end_time,
          room: section.room,
          course: {
            id: course.id,
            code: course.code,
            title: course.title,
            credits: typeof course.credits === "string" ? Number(course.credits) : course.credits,
          },
        },
      },
    ];
  });

  const payload = { enrollments };
  const parsed = MyEnrollmentsResponseSchema.safeParse(payload);

  if (!parsed.success) {
    return errorResponse(500, "invalid_response", "Student enrollments response validation failed.");
  }

  return successResponse(200, parsed.data);
}
