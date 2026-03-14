import { LoadingCard } from "@/components/ui/loading-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { LoadingTable } from "@/components/ui/loading-table";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-6 w-28 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-72 max-w-full" />
            <Skeleton className="h-4 w-[32rem] max-w-full" />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
      </header>

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <LoadingSpinner className="h-4 w-4 text-teal-600" />
        <span>Loading dashboard workspace...</span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <LoadingCard lines={2} showHeader={false} />
        <LoadingCard lines={2} showHeader={false} />
        <LoadingCard lines={2} showHeader={false} />
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)] backdrop-blur-sm">
          <div className="space-y-3">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <LoadingTable columns={5} rows={5} />
        </div>

        <LoadingCard lines={5} />
      </section>
    </section>
  );
}
