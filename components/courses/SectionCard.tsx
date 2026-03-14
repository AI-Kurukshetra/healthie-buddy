import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  return (
    <Card className="h-full">
      <CardHeader className="space-y-1 p-4">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {section.term} · {section.sectionCode}
        </p>
        <CardTitle className="text-base">{section.dayLabel}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0 text-sm text-gray-700">
        <p>
          <span className="font-medium text-gray-900">Time:</span> {section.timeLabel}
        </p>
        <p>
          <span className="font-medium text-gray-900">Instructor:</span> {section.instructorName ?? "TBD"}
        </p>
        <p>
          <span className="font-medium text-gray-900">Room:</span> {section.room ?? "TBD"}
        </p>
        <p>
          <span className="font-medium text-gray-900">Capacity:</span> {section.enrolledCount}/{section.capacity}
        </p>
        <p>
          <span className="font-medium text-gray-900">Seats remaining:</span> {section.seatsRemaining}
        </p>
      </CardContent>
    </Card>
  );
}
