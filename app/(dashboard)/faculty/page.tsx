import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { AppLink } from "@/components/ui/app-link";
import { FacultySections, type FacultySectionView } from "@/components/dashboard/FacultySections";
import { GradingQueue } from "@/components/dashboard/GradingQueue";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Faculty Dashboard</h1>
          <p className="text-sm text-slate-500">Faculty profile not found.</p>
        </header>
      </section>
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
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Faculty Dashboard</h1>
          <p className="text-sm text-slate-500">Could not load assigned sections.</p>
        </header>
      </section>
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

  const totalStudents = sectionViews.reduce((sum, section) => sum + section.enrolledStudents, 0);
  const sectionsNeedingGrading = sectionViews.filter((section) => section.completionPercent < 100).length;

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary">Faculty Dashboard</Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Teaching load and grading progress
            </h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Track teaching load and grading progress, {user.fullName}.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <AppLink className={buttonVariants({ variant: "outline" })} href="/faculty/sections">
            View Sections
          </AppLink>
          <AppLink className={buttonVariants({ variant: "secondary" })} href="/faculty/gradebook">
            Open Gradebook
          </AppLink>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Faculty Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Assigned Sections</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{sectionViews.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Students</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{totalStudents}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Needs Grading</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{sectionsNeedingGrading}</p>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <FacultySections sections={sectionViews} />
        <GradingQueue sections={sectionViews} />
      </section>
    </section>
  );
}
