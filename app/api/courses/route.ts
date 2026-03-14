import { createClient } from "@/lib/supabase/server";
import { requireAuthenticatedContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/http";

type CourseRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  credits: number;
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

  return successResponse(200, { courses: (data ?? []) as CourseRow[] });
}
