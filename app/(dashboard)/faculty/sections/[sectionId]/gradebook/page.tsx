import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { GradebookTable } from "@/components/gradebook/GradebookTable";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SectionRow = {
  id: string;
  term: string;
  section_code: string;
  courses:
    | {
        code: string;
        title: string;
      }
    | {
        code: string;
        title: string;
      }[]
    | null;
};

type FacultyRow = {
  id: string;
};

type PageProps = {
  params: Promise<{ sectionId: string }>;
};

export const metadata: Metadata = {
  title: "Faculty Gradebook | NextGen Campus Hub",
  description: "Manage section assignments and student scores.",
};

function getSingle<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function FacultyGradebookPage({ params }: PageProps) {
  const user = await requireRole("faculty");
  const { sectionId } = await params;
  const supabase = await createClient();

  const { data: facultyRow } = await supabase
    .from("faculty")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle<FacultyRow>();

  if (!facultyRow?.id) {
    notFound();
  }

  const { data: sectionRows, error: sectionsError } = await supabase
    .from("sections")
    .select("id,term,section_code,courses!inner(code,title)")
    .eq("faculty_id", facultyRow.id)
    .order("term", { ascending: true })
    .order("section_code", { ascending: true });

  if (sectionsError) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Faculty Gradebook</h1>
        <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not load your teaching sections.
        </p>
      </section>
    );
  }

  const sections = ((sectionRows ?? []) as SectionRow[]).map((section) => {
    const course = getSingle(section.courses);

    return {
      id: section.id,
      label: `${section.term} • ${section.section_code} • ${course?.code ?? ""} ${course?.title ?? ""}`,
    };
  });

  if (sections.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Faculty Gradebook</h1>
        <p className="text-sm text-slate-500">No assigned sections found.</p>
      </section>
    );
  }

  const activeSectionId = sections.some((section) => section.id === sectionId) ? sectionId : sections[0].id;

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary">Gradebook</Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Manage roster scoring</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Manage roster scores for your assigned sections, {user.fullName}.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <AppLink className={buttonVariants({ variant: "outline" })} href="/faculty">
            Faculty Dashboard
          </AppLink>
          <AppLink className={buttonVariants({ variant: "secondary" })} href="/faculty/sections">
            All Sections
          </AppLink>
        </div>
      </header>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <p className="text-sm text-slate-500">Use the section selector below, then submit all score edits at once.</p>
        </CardContent>
      </Card>

      <GradebookTable sectionOptions={sections} currentSectionId={activeSectionId} />
    </section>
  );
}
