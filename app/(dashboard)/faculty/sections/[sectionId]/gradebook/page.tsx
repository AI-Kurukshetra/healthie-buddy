import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { GradebookTable } from "@/components/gradebook/GradebookTable";
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
      <main className="mx-auto min-h-screen w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Faculty Gradebook</h1>
        <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Could not load your teaching sections.
        </p>
      </main>
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
      <main className="mx-auto min-h-screen w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Faculty Gradebook</h1>
        <p className="mt-2 text-sm text-gray-600">No assigned sections found.</p>
      </main>
    );
  }

  const activeSectionId = sections.some((section) => section.id === sectionId) ? sectionId : sections[0].id;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Faculty Gradebook</h1>
        <p className="text-sm text-gray-600">Manage roster scores for your assigned sections, {user.fullName}.</p>
      </header>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Link href="/faculty" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700">
            Back to Faculty Dashboard
          </Link>
          <p className="text-sm text-gray-600">Use the section selector below, then submit all score edits at once.</p>
        </CardContent>
      </Card>

      <GradebookTable sectionOptions={sections} currentSectionId={activeSectionId} />
    </main>
  );
}
