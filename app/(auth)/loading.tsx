import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[420px] items-center px-4 py-10 sm:px-6">
      <Card className="w-full">
        <CardHeader className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <LoadingSpinner className="h-4 w-4 text-teal-600" />
            <span>Preparing authentication form...</span>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-11 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-11 w-full" />
          </div>

          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    </main>
  );
}
