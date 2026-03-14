import { createClient } from "@/lib/supabase/server";
import { requireStudentContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/http";

type EnrollmentViewRow = {
  id: string;
  status: string;
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
              credits: number;
            }
          | {
              id: string;
              code: string;
              title: string;
              credits: number;
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
              credits: number;
            }
          | {
              id: string;
              code: string;
              title: string;
              credits: number;
            }[]
          | null;
      }[]
    | null;
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

  return successResponse(200, { enrollments: (data ?? []) as EnrollmentViewRow[] });
}
