import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GpaSummaryCardProps = {
  gpa: number;
  creditsAttempted: number;
  creditsCompleted: number;
  totalCourses: number;
  completedCourses: number;
};

export function GpaSummaryCard({
  gpa,
  creditsAttempted,
  creditsCompleted,
  totalCourses,
  completedCourses,
}: GpaSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">GPA Summary</CardTitle>
        <CardDescription>Weighted GPA based on completed sections and course credits.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-md border border-gray-200 p-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Current GPA</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{gpa.toFixed(2)}</p>
        </div>

        <div className="rounded-md border border-gray-200 p-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Credits Attempted</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{creditsAttempted.toFixed(1)}</p>
        </div>

        <div className="rounded-md border border-gray-200 p-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Credits Completed</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{creditsCompleted.toFixed(1)}</p>
        </div>

        <div className="rounded-md border border-gray-200 p-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Courses</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{totalCourses}</p>
        </div>

        <div className="rounded-md border border-gray-200 p-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Completed</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{completedCourses}</p>
        </div>
      </CardContent>
    </Card>
  );
}
