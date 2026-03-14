import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        <CardTitle className="text-xl">Pending Grading Tasks</CardTitle>
        <CardDescription>Sections with incomplete gradebook scoring activity.</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingSections.length === 0 ? (
          <p className="text-sm text-gray-600">All section score entries are up to date.</p>
        ) : (
          <div className="space-y-3">
            {pendingSections.map((section) => (
              <div key={section.sectionId} className="rounded-md border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {section.courseCode} {section.courseTitle}
                    </p>
                    <p className="text-xs text-gray-600">
                      {section.term} • {section.sectionCode}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{section.completionPercent.toFixed(0)}%</p>
                </div>

                <p className="mt-2 text-xs text-gray-600">{section.completionLabel}</p>

                <div className="mt-3">
                  <Link
                    href={`/dashboard/faculty/sections/${section.sectionId}/gradebook`}
                    className="rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
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
