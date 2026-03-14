import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentTranscriptAggregate } from "@/lib/api/transcripts";
import { GpaSummaryCard } from "@/components/transcript/GpaSummaryCard";
import { TranscriptTable } from "@/components/transcript/TranscriptTable";

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
      <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">Student Transcript</h1>
          <p className="text-sm text-gray-600">Your profile is missing a student record.</p>
        </header>
      </main>
    );
  }

  const { data, error } = await getStudentTranscriptAggregate(supabase, studentRow.id);

  if (error || !data) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">Student Transcript</h1>
          <p className="text-sm text-gray-600">Could not load transcript data right now.</p>
        </header>
      </main>
    );
  }

  const completedCourses = data.courses.filter((course) => course.status === "completed").length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Student Transcript</h1>
        <p className="text-sm text-gray-600">Track your academic standing and review grade breakdowns, {user.fullName}.</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Link href="/student" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700">
          Back to Student Dashboard
        </Link>
        <Link href="/courses" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700">
          Browse Course Catalog
        </Link>
      </div>

      <GpaSummaryCard
        gpa={data.gpa}
        creditsAttempted={data.credits_attempted}
        creditsCompleted={data.credits_completed}
        totalCourses={data.courses.length}
        completedCourses={completedCourses}
      />

      <TranscriptTable courses={data.courses} />
    </main>
  );
}
