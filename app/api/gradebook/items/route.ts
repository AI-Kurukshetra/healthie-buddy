import { createClient } from "@/lib/supabase/server";
import { requireFacultyContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/http";
import { CreateGradebookItemResponseSchema } from "@/lib/validations/api-contracts";
import { CreateGradebookItemSchema } from "@/lib/validations/gradebook";

type SectionOwnerRow = {
  id: string;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = CreateGradebookItemSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse(400, "invalid_input", "Invalid gradebook item payload.");
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

  const { data: sectionRow, error: sectionError } = await supabase
    .from("sections")
    .select("id")
    .eq("id", parsed.data.sectionId)
    .eq("faculty_id", facultyContext.facultyId)
    .maybeSingle<SectionOwnerRow>();

  if (sectionError) {
    return errorResponse(500, "section_lookup_failed", "Could not verify section ownership.");
  }

  if (!sectionRow) {
    return errorResponse(403, "forbidden", "You can only create items for your own sections.");
  }

  const { data: item, error: insertError } = await supabase
    .from("gradebook_items")
    .insert({
      section_id: parsed.data.sectionId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      max_points: parsed.data.maxPoints,
      due_at: parsed.data.dueAt ?? null,
    })
    .select("id,section_id,title,description,max_points,due_at")
    .maybeSingle<{
      id: string;
      section_id: string;
      title: string;
      description: string | null;
      max_points: number;
      due_at: string | null;
    }>();

  if (insertError) {
    return errorResponse(500, "item_create_failed", "Could not create gradebook item.");
  }

  const payload = {
    item: {
      id: item?.id ?? null,
      sectionId: item?.section_id ?? parsed.data.sectionId,
      title: item?.title ?? parsed.data.title,
      description: item?.description ?? parsed.data.description ?? null,
      maxPoints: item?.max_points ?? parsed.data.maxPoints,
      dueAt: item?.due_at ?? parsed.data.dueAt ?? null,
    },
  };
  const parsedResponse = CreateGradebookItemResponseSchema.safeParse(payload);

  if (!parsedResponse.success) {
    return errorResponse(500, "invalid_response", "Gradebook item response validation failed.");
  }

  return successResponse(201, parsedResponse.data);
}
