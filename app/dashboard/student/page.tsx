import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

type CourseRow = {
  code: string;
  title: string;
  credits: number;
};

type SectionRow = {
  id: string;
  term: string;
  section_code: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  capacity: number;
  courses: CourseRow | CourseRow[] | null;
};

type EnrollmentRow = {
  section_id: string;
};

const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export const metadata: Metadata = {
  title: "Course Catalog | NextGen Campus Hub",
  description: "Browse available courses and section schedules.",
};

function getCourse(course: SectionRow["courses"]): CourseRow | null {
  if (!course) {
    return null;
  }

  return Array.isArray(course) ? (course[0] ?? null) : course;
}

function formatTime(value: string): string {
  return value.slice(0, 5);
}

export default async function StudentPage() {
  const user = await requireRole("student");
  const supabase = await createClient();

  const { data: sectionsData, error: sectionsError } = await supabase
    .from("sections")
    .select(
      "id,term,section_code,day_of_week,start_time,end_time,room,capacity,courses(code,title,credits)",
    )
    .order("term", { ascending: true })
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (sectionsError) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Course Catalog</h1>
        <p className="mt-2 text-sm text-red-700">
          Could not load course sections right now. Please try again.
        </p>
      </main>
    );
  }

  const sections = (sectionsData ?? []) as SectionRow[];
  const sectionIds = sections.map((section) => section.id);

  const enrolledCounts = new Map<string, number>();

  if (sectionIds.length > 0) {
    const { data: enrollmentData } = await supabase
      .from("enrollments")
      .select("section_id")
      .in("section_id", sectionIds)
      .eq("status", "enrolled");

    for (const enrollment of (enrollmentData ?? []) as EnrollmentRow[]) {
      const current = enrolledCounts.get(enrollment.section_id) ?? 0;
      enrolledCounts.set(enrollment.section_id, current + 1);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Course Catalog</h1>
          <p className="mt-1 text-sm text-gray-600">Welcome {user.fullName}.</p>
        </div>
        <Link href="/dashboard" className="rounded-md border border-gray-300 px-3 py-2 text-sm">
          Back to dashboard
        </Link>
      </div>

      {sections.length === 0 ? (
        <p className="mt-8 rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-600">
          No sections are currently published.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {sections.map((section) => {
            const course = getCourse(section.courses);
            const enrolled = enrolledCounts.get(section.id) ?? 0;
            const seatsRemaining = Math.max(section.capacity - enrolled, 0);

            return (
              <article key={section.id} className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {section.term} • {section.section_code}
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  {course?.code ?? "Unknown code"}: {course?.title ?? "Untitled course"}
                </h2>
                <p className="mt-1 text-sm text-gray-600">Credits: {course?.credits ?? "-"}</p>

                <dl className="mt-4 space-y-1 text-sm text-gray-700">
                  <div>
                    <dt className="inline font-medium">Schedule:</dt>{" "}
                    <dd className="inline">
                      {DAY_LABELS[section.day_of_week] ?? "Unknown day"} {formatTime(section.start_time)}-
                      {formatTime(section.end_time)}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Room:</dt>{" "}
                    <dd className="inline">{section.room ?? "TBD"}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Capacity:</dt>{" "}
                    <dd className="inline">{enrolled}/{section.capacity} enrolled</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium">Seats remaining:</dt>{" "}
                    <dd className="inline">{seatsRemaining}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
