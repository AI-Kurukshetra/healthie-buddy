import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentTranscriptAggregate } from "@/lib/api/transcripts";
import { GpaSummaryCard } from "@/components/transcript/GpaSummaryCard";
import { TranscriptTable } from "@/components/transcript/TranscriptTable";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

type StudentRow = {
  id: string;
};

export const metadata: Metadata = {
  title: "Student Transcript | NextGen Campus Hub",
  description: "Review completed courses, final grades, and GPA.",
};

export default async function StudentTranscriptPage() {
  const user = await requireRole("student");
  const supabase = await createClient();

  const { data: studentRow, error: studentError } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle<StudentRow>();

  if (studentError || !studentRow?.id) {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Student Transcript</h1>
          <p className="text-sm text-slate-500">Your profile is missing a student record.</p>
        </header>
      </section>
    );
  }

  const { data, error } = await getStudentTranscriptAggregate(supabase, studentRow.id);

  if (error || !data) {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Student Transcript</h1>
          <p className="text-sm text-slate-500">Could not load transcript data right now.</p>
        </header>
      </section>
    );
  }

  const completedCourses = data.courses.filter((course) => course.status === "completed").length;

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary">Transcript</Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Academic standing and grade detail</h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Track your academic standing and review grade breakdowns, {user.fullName}.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className={buttonVariants({ variant: "outline" })} href="/student">
            Dashboard
          </Link>
          <Link className={buttonVariants({ variant: "secondary" })} href="/courses">
            Browse Courses
          </Link>
        </div>
      </header>

      <GpaSummaryCard
        gpa={data.gpa}
        creditsAttempted={data.credits_attempted}
        creditsCompleted={data.credits_completed}
        totalCourses={data.courses.length}
        completedCourses={completedCourses}
      />

      <TranscriptTable courses={data.courses} />
    </section>
  );
}
