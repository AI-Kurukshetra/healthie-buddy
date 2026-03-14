import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type SectionView = {
  id: string;
  term: string;
  sectionCode: string;
  dayLabel: string;
  timeLabel: string;
  room: string | null;
  instructorName: string | null;
  capacity: number;
  enrolledCount: number;
  seatsRemaining: number;
};

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
      </CardContent>
    </Card>
  );
}
