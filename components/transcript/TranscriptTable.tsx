import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TranscriptCourse } from "@/lib/api/transcripts";

const DAY_LABELS: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

function formatTime(time: string): string {
  return time.slice(0, 5);
}

type TranscriptTableProps = {
  courses: TranscriptCourse[];
};

export function TranscriptTable({ courses }: TranscriptTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Transcript</CardTitle>
        <CardDescription>Completed and in-progress sections with calculated final grades.</CardDescription>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-sm text-slate-500">No transcript records yet. Enroll in a course to begin.</p>
        ) : (
          <div className="-mx-1 overflow-x-auto px-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-56">Course</TableHead>
                  <TableHead className="min-w-36">Term / Section</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Final Grade</TableHead>
                  <TableHead>GPA Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.enrollmentId}>
                    <TableCell>
                      <p className="font-medium text-slate-950">
                        {course.courseCode} {course.courseTitle}
                      </p>
                      {course.hasGradebookItems ? (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-slate-500">Grade Breakdown</p>
                          {course.breakdown.map((item) => (
                            <p key={item.itemId} className="text-xs text-slate-500">
                              {item.title}: {item.score ?? "-"}/{item.maxPoints}
                              {item.percentage !== null ? ` (${item.percentage.toFixed(1)}%)` : ""}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400">No gradebook item breakdown available.</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-950">{course.term}</p>
                      <p className="text-xs text-slate-500">{course.sectionCode}</p>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {DAY_LABELS[course.dayOfWeek] ?? "-"} {formatTime(course.startTime)}-{formatTime(course.endTime)}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{course.credits.toFixed(1)}</TableCell>
                    <TableCell>
                      <Badge variant={course.status === "completed" ? "success" : "outline"}>{course.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-950">{course.finalGrade ?? "-"}</p>
                      <p className="text-xs text-slate-400">
                        {course.weightedPercentage !== null ? `${course.weightedPercentage.toFixed(1)}%` : "No computed grade"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {course.gradePoints !== null ? course.gradePoints.toFixed(2) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
