import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnrollmentButton } from "@/components/courses/EnrollmentButton";
import type { SectionView } from "@/components/courses/types";

type SectionCardProps = {
  section: SectionView;
};

export function SectionCard({ section }: SectionCardProps) {
  const seatVariant = section.seatsRemaining > 0 ? "success" : "warning";

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline">{section.term}</Badge>
          <Badge variant={seatVariant}>{section.seatsRemaining} seats left</Badge>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{section.sectionCode}</p>
          <CardTitle className="mt-2 text-lg">{section.dayLabel}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-5 pt-0 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-950">Time:</span> {section.timeLabel}
        </p>
        <p>
          <span className="font-medium text-slate-950">Instructor:</span> {section.instructorName ?? "TBD"}
        </p>
        <p>
          <span className="font-medium text-slate-950">Room:</span> {section.room ?? "TBD"}
        </p>
        <p>
          <span className="font-medium text-slate-950">Capacity:</span> {section.enrolledCount}/{section.capacity}
        </p>
        {section.showEnrollmentAction ? (
          <div className="space-y-2 border-t border-slate-200/80 pt-3">
            <EnrollmentButton
              enrollmentStatus={section.enrollmentStatus}
              seatsRemaining={section.seatsRemaining}
              sectionCode={section.sectionCode}
              sectionId={section.id}
            />
            <p className="text-xs text-slate-500">
              We will confirm availability and flag any schedule or eligibility issues before enrollment is finalized.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
