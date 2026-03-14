import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type LoadingCardProps = {
  className?: string;
  lines?: number;
  showHeader?: boolean;
};

const WIDTHS = ["w-full", "w-5/6", "w-2/3", "w-3/4"];

export function LoadingCard({
  className,
  lines = 3,
  showHeader = true,
}: LoadingCardProps) {
  return (
    <Card className={cn(className)}>
      {showHeader ? (
        <CardHeader className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-2/3" />
        </CardHeader>
      ) : null}
      <CardContent className={cn("space-y-3", !showHeader && "pt-6")}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={index} className={cn("h-4", WIDTHS[index % WIDTHS.length])} />
        ))}
      </CardContent>
    </Card>
  );
}
