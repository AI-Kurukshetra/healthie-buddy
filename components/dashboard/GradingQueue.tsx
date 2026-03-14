import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { FacultySectionView } from "@/components/dashboard/FacultySections";

type GradingQueueProps = {
  sections: FacultySectionView[];
};

export function GradingQueue({ sections }: GradingQueueProps) {
  const pendingSections = sections
    .filter((section) => section.completionPercent < 100)
    .sort((a, b) => a.completionPercent - b.completionPercent);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Pending Grading</CardTitle>
        <CardDescription>Sections with incomplete gradebook scoring activity.</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingSections.length === 0 ? (
          <p className="text-sm text-slate-500">All section score entries are up to date.</p>
        ) : (
          <div className="space-y-4">
            {pendingSections.map((section) => (
              <div key={section.sectionId} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">
                      {section.courseCode} {section.courseTitle}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{section.term}</Badge>
                      <Badge variant="secondary">{section.sectionCode}</Badge>
                    </div>
                  </div>
                  <Badge variant="warning">{section.completionPercent.toFixed(0)}%</Badge>
                </div>

                <p className="mt-3 text-sm text-slate-500">{section.completionLabel}</p>
                <div className="mt-3">
                  <Progress value={section.completionPercent} />
                </div>

                <div className="mt-3">
                  <Link
                    className={buttonVariants({ size: "sm", variant: "outline" })}
                    href={`/faculty/sections/${section.sectionId}/gradebook`}
                  >
                    Continue Grading
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
