import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { FacultySections, type FacultySectionView } from "@/components/dashboard/FacultySections";
import { GradingQueue } from "@/components/dashboard/GradingQueue";
import { Card, CardContent } from "@/components/ui/card";

type FacultyRow = {
  id: string;
};

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

type EnrollmentCountRow = {
  section_id: string;
};

type GradebookItemRow = {
  id: string;
  section_id: string;
};

type GradebookScoreRow = {
  item_id: string;
};

function asSingle<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function getCompletionLabel(gradebookItems: number, enrolledStudents: number, completionPercent: number): string {
  if (gradebookItems === 0) {
    return "No gradebook items created.";
  }

  if (enrolledStudents === 0) {
    return "No enrolled students in this section.";
  }

  if (completionPercent >= 100) {
    return "All score cells completed.";
  }

  return "Pending score entries remain.";
}

export const metadata: Metadata = {
  title: "Faculty Dashboard | NextGen Campus Hub",
  description: "View assigned sections, grading workload, and gradebook status.",
};

export default async function FacultyDashboardPage() {
  const user = await requireRole("faculty");
  const supabase = await createClient();

  const { data: facultyRow, error: facultyError } = await supabase
    .from("faculty")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle<FacultyRow>();

  if (facultyError || !facultyRow?.id) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">Faculty Dashboard</h1>
          <p className="text-sm text-gray-600">Faculty profile not found.</p>
        </header>
      </main>
    );
  }

  const { data: sectionRows, error: sectionError } = await supabase
    .from("sections")
    .select("id,term,section_code,courses!inner(code,title)")
    .eq("faculty_id", facultyRow.id)
    .order("term", { ascending: true })
    .order("section_code", { ascending: true });

  if (sectionError) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">Faculty Dashboard</h1>
          <p className="text-sm text-gray-600">Could not load assigned sections.</p>
        </header>
      </main>
    );
  }

  const sections = (sectionRows ?? []) as SectionRow[];
  const sectionIds = sections.map((section) => section.id);

  const { data: enrollmentRows } = sectionIds.length
    ? await supabase
        .from("enrollments")
        .select("section_id")
        .in("section_id", sectionIds)
        .in("status", ["enrolled", "completed"])
    : { data: [] as EnrollmentCountRow[] };

  const { data: itemRows } = sectionIds.length
    ? await supabase
        .from("gradebook_items")
        .select("id,section_id")
        .in("section_id", sectionIds)
    : { data: [] as GradebookItemRow[] };

  const gradebookItems = (itemRows ?? []) as GradebookItemRow[];
  const itemIds = gradebookItems.map((item) => item.id);

  const { data: scoreRows } = itemIds.length
    ? await supabase
        .from("gradebook_scores")
        .select("item_id")
        .in("item_id", itemIds)
    : { data: [] as GradebookScoreRow[] };

  const enrollments = (enrollmentRows ?? []) as EnrollmentCountRow[];
  const scores = (scoreRows ?? []) as GradebookScoreRow[];

  const studentsBySection = new Map<string, number>();
  for (const row of enrollments) {
    const count = studentsBySection.get(row.section_id) ?? 0;
    studentsBySection.set(row.section_id, count + 1);
  }

  const itemsBySection = new Map<string, number>();
  const itemToSection = new Map<string, string>();
  for (const item of gradebookItems) {
    const count = itemsBySection.get(item.section_id) ?? 0;
    itemsBySection.set(item.section_id, count + 1);
    itemToSection.set(item.id, item.section_id);
  }

  const scoresBySection = new Map<string, number>();
  for (const score of scores) {
    const sectionId = itemToSection.get(score.item_id);
    if (!sectionId) {
      continue;
    }

    const count = scoresBySection.get(sectionId) ?? 0;
    scoresBySection.set(sectionId, count + 1);
  }

  const sectionViews: FacultySectionView[] = sections.map((section) => {
    const course = asSingle(section.courses);
    const enrolledStudents = studentsBySection.get(section.id) ?? 0;
    const gradebookItemCount = itemsBySection.get(section.id) ?? 0;
    const scoredCells = scoresBySection.get(section.id) ?? 0;
    const expectedCells = enrolledStudents * gradebookItemCount;

    const completionPercent =
      expectedCells > 0 ? Math.min((scoredCells / expectedCells) * 100, 100) : gradebookItemCount === 0 ? 0 : 100;

    return {
      sectionId: section.id,
      term: section.term,
      sectionCode: section.section_code,
      courseCode: course?.code ?? "",
      courseTitle: course?.title ?? "",
      enrolledStudents,
      gradebookItems: gradebookItemCount,
      completionPercent,
      completionLabel: getCompletionLabel(gradebookItemCount, enrolledStudents, completionPercent),
    };
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Faculty Dashboard</h1>
        <p className="text-sm text-gray-600">Track teaching load and grading progress, {user.fullName}.</p>
      </header>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <Link href="/dashboard" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Main Dashboard
          </Link>
          <p className="text-sm text-gray-600">Use gradebook links to enter and finalize section scores.</p>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <FacultySections sections={sectionViews} />
        <GradingQueue sections={sectionViews} />
      </section>
    </main>
  );
}
