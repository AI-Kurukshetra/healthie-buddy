import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentTranscriptAggregate } from "@/lib/api/transcripts";
import { GpaSummaryCard } from "@/components/transcript/GpaSummaryCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StudentRow = {
  id: string;
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

function formatTime(time: string): string {
  return time.slice(0, 5);
}

export const metadata: Metadata = {
  title: "Student Dashboard | NextGen Campus Hub",
  description: "View your GPA, enrolled courses, and upcoming schedule.",
};

export default async function StudentDashboardPage() {
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
          <h1 className="text-2xl font-semibold sm:text-3xl">Student Dashboard</h1>
          <p className="text-sm text-gray-600">Your student profile is missing. Contact an administrator.</p>
        </header>
      </main>
    );
  }

  const { data, error } = await getStudentTranscriptAggregate(supabase, studentRow.id);

  if (error || !data) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">Student Dashboard</h1>
          <p className="text-sm text-gray-600">Could not load dashboard data right now.</p>
        </header>
      </main>
    );
  }

  const enrolledCourses = data.courses.filter((course) => course.status === "enrolled");
  const upcomingSchedule = [...enrolledCourses]
    .sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }

      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, 6);

  const completedCourses = data.courses.filter((course) => course.status === "completed").length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Student Dashboard</h1>
        <p className="text-sm text-gray-600">Welcome back, {user.fullName}. Here is your academic snapshot.</p>
      </header>

      <GpaSummaryCard
        gpa={data.gpa}
        creditsAttempted={data.credits_attempted}
        creditsCompleted={data.credits_completed}
        totalCourses={data.courses.length}
        completedCourses={completedCourses}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Enrolled Courses</CardTitle>
            <CardDescription>Current active section registrations.</CardDescription>
          </CardHeader>
          <CardContent>
            {enrolledCourses.length === 0 ? (
              <p className="text-sm text-gray-600">No active enrollments found.</p>
            ) : (
              <div className="space-y-3">
                {enrolledCourses.map((course) => (
                  <div key={course.enrollmentId} className="rounded-md border border-gray-200 p-3">
                    <p className="font-medium text-gray-900">
                      {course.courseCode} {course.courseTitle}
                    </p>
                    <p className="text-sm text-gray-600">{course.term} • {course.sectionCode}</p>
                    <p className="text-xs text-gray-500">Credits: {course.credits.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Upcoming Section Schedule</CardTitle>
            <CardDescription>Weekly schedule for currently enrolled sections.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSchedule.length === 0 ? (
              <p className="text-sm text-gray-600">No upcoming section times available.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSchedule.map((course) => (
                  <div key={`${course.enrollmentId}-schedule`} className="rounded-md border border-gray-200 p-3">
                    <p className="font-medium text-gray-900">{course.courseCode} {course.sectionCode}</p>
                    <p className="text-sm text-gray-600">
                      {DAY_LABELS[course.dayOfWeek] ?? "Unknown day"} {formatTime(course.startTime)}-{formatTime(course.endTime)}
                    </p>
                    <p className="text-xs text-gray-500">Room: {course.room ?? "TBD"}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quick Links</CardTitle>
          <CardDescription>Jump to high-frequency student workflows.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/courses" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Course Catalog
          </Link>
          <Link href="/student/transcript" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Transcript
          </Link>
          <Link href="/" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Main Dashboard
          </Link>
          <Link href="/faculty" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Faculty Area
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
