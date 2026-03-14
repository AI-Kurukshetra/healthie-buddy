import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentTranscriptAggregate } from "@/lib/api/transcripts";
import { AppLink } from "@/components/ui/app-link";
import { GpaSummaryCard } from "@/components/transcript/GpaSummaryCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Student Dashboard</h1>
          <p className="text-sm text-slate-500">Your student profile is missing. Contact an administrator.</p>
        </header>
      </section>
    );
  }

  const { data, error } = await getStudentTranscriptAggregate(supabase, studentRow.id);

  if (error || !data) {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Student Dashboard</h1>
          <p className="text-sm text-slate-500">Could not load dashboard data right now.</p>
        </header>
      </section>
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
    <section className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary">Student Dashboard</Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Welcome back, {user.fullName}
            </h1>
            <p className="max-w-2xl text-sm text-slate-500">
              Keep track of your GPA, course load, and upcoming section schedule from one place.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <AppLink className={buttonVariants({ variant: "outline" })} href="/courses">
            Browse Courses
          </AppLink>
          <AppLink className={buttonVariants({ variant: "secondary" })} href="/student/transcript">
            Open Transcript
          </AppLink>
        </div>
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
            <CardTitle>Enrolled Courses</CardTitle>
            <CardDescription>Current active section registrations.</CardDescription>
          </CardHeader>
          <CardContent>
            {enrolledCourses.length === 0 ? (
              <p className="text-sm text-slate-500">No active enrollments found.</p>
            ) : (
              <div className="space-y-3">
                {enrolledCourses.map((course) => (
                  <div key={course.enrollmentId} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                    <p className="font-medium text-slate-950">
                      {course.courseCode} {course.courseTitle}
                    </p>
                    <p className="text-sm text-slate-500">{course.term} • {course.sectionCode}</p>
                    <p className="text-xs text-slate-400">Credits: {course.credits.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Section Schedule</CardTitle>
            <CardDescription>Weekly schedule for currently enrolled sections.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSchedule.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming section times available.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSchedule.map((course) => (
                  <div
                    key={`${course.enrollmentId}-schedule`}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4"
                  >
                    <p className="font-medium text-slate-950">{course.courseCode} {course.sectionCode}</p>
                    <p className="text-sm text-slate-500">
                      {DAY_LABELS[course.dayOfWeek] ?? "Unknown day"} {formatTime(course.startTime)}-{formatTime(course.endTime)}
                    </p>
                    <p className="text-xs text-slate-400">Room: {course.room ?? "TBD"}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Jump to high-frequency student workflows.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AppLink className={buttonVariants({ className: "justify-start", variant: "outline" })} href="/courses">
            Course Catalog
          </AppLink>
          <AppLink
            className={buttonVariants({ className: "justify-start", variant: "outline" })}
            href="/student/transcript"
          >
            Transcript
          </AppLink>
          <AppLink
            className={buttonVariants({ className: "justify-start", variant: "outline" })}
            href="/student/enrollments"
          >
            Enrollments
          </AppLink>
          <AppLink className={buttonVariants({ className: "justify-start", variant: "outline" })} href="/student">
            Dashboard Home
          </AppLink>
        </CardContent>
      </Card>
    </section>
  );
}
