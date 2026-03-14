import { createClient } from "@/lib/supabase/server";
import { requireAuthenticatedContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/http";
import { CoursesResponseSchema } from "@/lib/validations/api-contracts";

type CourseRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  credits: number | string;
};

export async function GET() {
  const supabase = await createClient();
  const { data: authContext, error: authError } = await requireAuthenticatedContext(supabase);

  if (authError || !authContext) {
    return errorResponse(authError?.status ?? 401, authError?.error ?? "unauthenticated", authError?.message ?? "You must be signed in.");
  }

  const { data, error } = await supabase
    .from("courses")
    .select("id,code,title,description,credits")
    .order("code", { ascending: true });

  if (error) {
    return errorResponse(500, "courses_lookup_failed", "Could not fetch courses.");
  }

  const payload = {
    courses: ((data ?? []) as CourseRow[]).map((course) => ({
      ...course,
      credits: typeof course.credits === "string" ? Number(course.credits) : course.credits,
    })),
  };
  const parsed = CoursesResponseSchema.safeParse(payload);

  if (!parsed.success) {
    return errorResponse(500, "invalid_response", "Courses response validation failed.");
  }

  return successResponse(200, parsed.data);
}
