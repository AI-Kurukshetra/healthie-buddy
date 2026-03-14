import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        <CardTitle className="text-xl">Transcript</CardTitle>
        <CardDescription>Completed and in-progress sections with calculated final grades.</CardDescription>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-600">No transcript records yet. Enroll in a course to begin.</p>
        ) : (
          <div className="-mx-2 overflow-x-auto px-2">
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
                      <p className="font-medium text-gray-900">
                        {course.courseCode} {course.courseTitle}
                      </p>
                      {course.hasGradebookItems ? (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-gray-600">Grade Breakdown</p>
                          {course.breakdown.map((item) => (
                            <p key={item.itemId} className="text-xs text-gray-600">
                              {item.title}: {item.score ?? "-"}/{item.maxPoints}
                              {item.percentage !== null ? ` (${item.percentage.toFixed(1)}%)` : ""}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-gray-500">No gradebook item breakdown available.</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{course.term}</p>
                      <p className="text-xs text-gray-600">{course.sectionCode}</p>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {DAY_LABELS[course.dayOfWeek] ?? "-"} {formatTime(course.startTime)}-{formatTime(course.endTime)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{course.credits.toFixed(1)}</TableCell>
                    <TableCell>
                      <span className="rounded-full border border-gray-300 px-2 py-1 text-xs capitalize text-gray-700">
                        {course.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">{course.finalGrade ?? "-"}</p>
                      <p className="text-xs text-gray-500">
                        {course.weightedPercentage !== null ? `${course.weightedPercentage.toFixed(1)}%` : "No computed grade"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
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
