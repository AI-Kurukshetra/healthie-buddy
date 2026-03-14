import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { getStudentTranscriptAggregate } from "@/lib/api/transcripts";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type StudentRow = {
  id: string;
};

const DAY_LABELS: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

function formatTime(time: string) {
  return time.slice(0, 5);
}

export const metadata: Metadata = {
  title: "Student Enrollments | Campus Management",
  description: "Review your current and completed course enrollments.",
};

export default async function StudentEnrollmentsPage() {
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
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Enrollments</h1>
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
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Enrollments</h1>
          <p className="text-sm text-slate-500">Could not load enrollment data right now.</p>
        </header>
      </section>
    );
  }

  const currentEnrollments = data.courses.filter((course) => course.status === "enrolled");
  const completedEnrollments = data.courses.filter((course) => course.status === "completed");

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Badge variant="secondary">Enrollments</Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Current and completed course registrations</h1>
            <p className="max-w-3xl text-sm text-slate-500">
              Review active section registrations and recent completed coursework, {user.fullName}.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <AppLink className={buttonVariants({ variant: "outline" })} href="/student">
            Dashboard
          </AppLink>
          <AppLink className={buttonVariants({ variant: "secondary" })} href="/courses">
            Browse Courses
          </AppLink>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Sections</CardTitle>
            <CardDescription>Enrollments currently in progress.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-950">{currentEnrollments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed Sections</CardTitle>
            <CardDescription>Sections that already count toward GPA.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-950">{completedEnrollments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Credits Attempted</CardTitle>
            <CardDescription>Total credits represented in your enrollments.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-950">{data.credits_attempted.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment List</CardTitle>
          <CardDescription>Active and completed sections across your student record.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.courses.length === 0 ? (
            <p className="text-sm text-slate-500">No enrollments found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Term / Section</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.courses.map((course) => (
                  <TableRow key={course.enrollmentId}>
                    <TableCell>
                      <p className="font-medium text-slate-950">
                        {course.courseCode} {course.courseTitle}
                      </p>
                      <p className="text-xs text-slate-500">{course.room ?? "Room TBD"}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-950">{course.term}</p>
                      <p className="text-xs text-slate-500">{course.sectionCode}</p>
                    </TableCell>
                    <TableCell>
                      {DAY_LABELS[course.dayOfWeek] ?? "-"} {formatTime(course.startTime)}-{formatTime(course.endTime)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.status === "completed" ? "success" : "secondary"}>{course.status}</Badge>
                    </TableCell>
                    <TableCell>{course.credits.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
