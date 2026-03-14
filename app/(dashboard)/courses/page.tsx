import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { CourseCatalog, type CourseCatalogItem } from "@/components/courses/CourseCatalog";

type CourseRow = {
  id: string;
  code: string;
  title: string;
  credits: number;
};

type InstructorUserRow = {
  full_name: string | null;
};

type FacultyRow = {
  users: InstructorUserRow | InstructorUserRow[] | null;
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
  faculty: FacultyRow | FacultyRow[] | null;
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
  title: "Courses | NextGen Campus Hub",
  description: "Browse courses and section schedules.",
};

function getSingle<T>(value: T | T[] | null): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function formatTime(value: string): string {
  return value.slice(0, 5);
}

export default async function CoursesPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: sectionsData, error: sectionsError } = await supabase
    .from("sections")
    .select(
      "id,term,section_code,day_of_week,start_time,end_time,room,capacity,courses(id,code,title,credits),faculty:faculty_id(users:user_id(full_name))",
    )
    .order("term", { ascending: true })
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (sectionsError) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">Course Catalog</h1>
          <p className="text-sm text-gray-600">Browse published courses and sections.</p>
        </header>
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load courses right now. Please try again.
        </p>
      </main>
    );
  }

  const sections = (sectionsData ?? []) as SectionRow[];
  const sectionIds = sections.map((section) => section.id);
  const enrolledCounts = new Map<string, number>();

  if (sectionIds.length > 0) {
    const { data: enrollmentsData } = await supabase
      .from("enrollments")
      .select("section_id")
      .in("section_id", sectionIds)
      .eq("status", "enrolled");

    for (const enrollment of (enrollmentsData ?? []) as EnrollmentRow[]) {
      const current = enrolledCounts.get(enrollment.section_id) ?? 0;
      enrolledCounts.set(enrollment.section_id, current + 1);
    }
  }

  const courseMap = new Map<string, CourseCatalogItem>();

  for (const section of sections) {
    const course = getSingle(section.courses);
    if (!course) {
      continue;
    }

    const faculty = getSingle(section.faculty);
    const instructorUser = getSingle(faculty?.users ?? null);
    const enrolledCount = enrolledCounts.get(section.id) ?? 0;
    const seatsRemaining = Math.max(section.capacity - enrolledCount, 0);

    const sectionView = {
      id: section.id,
      term: section.term,
      sectionCode: section.section_code,
      dayLabel: DAY_LABELS[section.day_of_week] ?? "Unknown day",
      timeLabel: `${formatTime(section.start_time)} - ${formatTime(section.end_time)}`,
      room: section.room,
      instructorName: instructorUser?.full_name ?? null,
      capacity: section.capacity,
      enrolledCount,
      seatsRemaining,
    };

    const existingCourse = courseMap.get(course.id);

    if (existingCourse) {
      existingCourse.sections.push(sectionView);
      continue;
    }

    courseMap.set(course.id, {
      id: course.id,
      code: course.code,
      title: course.title,
      credits: course.credits,
      sections: [sectionView],
    });
  }

  const courses = [...courseMap.values()];

  return <CourseCatalog userName={user.fullName} courses={courses} />;
}
