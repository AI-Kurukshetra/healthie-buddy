import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const metrics = [
    { label: "Current GPA", value: gpa.toFixed(2), tone: "text-slate-950" },
    { label: "Credits Attempted", value: creditsAttempted.toFixed(1), tone: "text-slate-900" },
    { label: "Credits Completed", value: creditsCompleted.toFixed(1), tone: "text-slate-900" },
    { label: "Courses", value: `${totalCourses}`, tone: "text-slate-900" },
    { label: "Completed", value: `${completedCourses}`, tone: "text-slate-900" },
  ];

  return (
    <Card>
      <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl">GPA Summary</CardTitle>
          <CardDescription>Weighted GPA based on completed sections and course credits.</CardDescription>
        </div>
        <Badge variant="secondary">Academic Snapshot</Badge>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{metric.label}</p>
            <p className={`mt-3 ${index === 0 ? "text-3xl" : "text-2xl"} font-semibold ${metric.tone}`}>
              {metric.value}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
