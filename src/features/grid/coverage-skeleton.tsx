import { Skeleton } from "@/components/ui/skeleton";

/** The shape of the feeder directory while a page of it loads. */
export function CoverageResultsSkeleton() {
  return (
    <div aria-busy className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <span className="sr-only">Loading feeders…</span>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="bg-card flex flex-col gap-4 rounded-3xl border p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-44" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-1.5 border-t pt-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
