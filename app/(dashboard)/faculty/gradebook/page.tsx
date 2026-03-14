import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

type FacultyRow = {
  id: string;
};

type SectionRow = {
  id: string;
};

export const metadata: Metadata = {
  title: "Faculty Gradebook Redirect | Campus Management",
  description: "Open the first available faculty gradebook section.",
};

export default async function FacultyGradebookPage() {
  const user = await requireRole("faculty");
  const supabase = await createClient();

  const { data: facultyRow } = await supabase
    .from("faculty")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle<FacultyRow>();

  if (!facultyRow?.id) {
    return (
      <section className="space-y-4">
        <Badge variant="secondary">Gradebook</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Gradebook unavailable</h1>
        <p className="text-sm text-slate-500">No faculty profile was found for your account.</p>
      </section>
    );
  }

  const { data: sections } = await supabase
    .from("sections")
    .select("id")
    .eq("faculty_id", facultyRow.id)
    .order("term", { ascending: true })
    .order("section_code", { ascending: true });

  const firstSection = (sections ?? []) as SectionRow[];

  if (firstSection.length === 0) {
    return (
      <section className="space-y-4">
        <Badge variant="secondary">Gradebook</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">No sections available</h1>
        <p className="text-sm text-slate-500">Assign a section to this faculty member before opening the gradebook.</p>
      </section>
    );
  }

  redirect(`/faculty/sections/${firstSection[0].id}/gradebook`);
}
