import { StatCardSkeleton } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

// The loading.tsx of each dashboard route shows one of these: the outline of
// the page that is about to arrive, so nothing jumps when the data lands.

function HeaderSkeleton({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      {withAction ? <Skeleton className="h-9 w-36" /> : null}
    </div>
  );
}

function Busy({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div aria-busy className="flex flex-1 flex-col gap-6">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** A page of headline numbers followed by panels and a chart. */
export function OverviewSkeleton() {
  return (
    <Busy label="Loading your dashboard…">
      <HeaderSkeleton />
      <Skeleton className="h-36 rounded-3xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-64 rounded-2xl xl:col-span-2" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      <Skeleton className="h-80 rounded-2xl" />
    </Busy>
  );
}

/** A page with optional headline numbers, a filter row and a table. */
export function TablePageSkeleton({
  search = true,
  filters = 2,
  stats = 0,
}: {
  /** Whether the filter row starts with a search box. */
  search?: boolean;
  /** How many dropdown filters follow it. */
  filters?: number;
  /** How many stat tiles sit above the filters. */
  stats?: number;
}) {
  return (
    <Busy label="Loading…">
      <HeaderSkeleton />
      {stats > 0 ? (
        <div className={stats === 3 ? "grid gap-4 sm:grid-cols-3" : "grid gap-4 sm:grid-cols-2 xl:grid-cols-4"}>
          {Array.from({ length: stats }, (_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        {search ? <Skeleton className="h-9 w-full sm:max-w-xs" /> : null}
        {Array.from({ length: filters }, (_, index) => (
          <Skeleton key={index} className="h-9 w-full sm:w-44" />
        ))}
      </div>
      <div className="bg-card overflow-hidden rounded-2xl border">
        <Skeleton className="h-11 rounded-none" />
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-6 border-t px-4 py-3.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="hidden h-4 w-28 sm:block" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </Busy>
  );
}

/** A page that lists cards (outages, jobs, schedule days). */
export function CardListSkeleton({ cards = 4, filters = true }: { cards?: number; filters?: boolean }) {
  return (
    <Busy label="Loading…">
      <HeaderSkeleton />
      {filters ? (
        <div className="flex gap-3">
          <Skeleton className="h-9 w-44" />
        </div>
      ) : null}
      <div className="flex flex-col gap-4">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="bg-card flex flex-col gap-3 rounded-2xl border p-5">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-4 w-64" />
          </div>
        ))}
      </div>
    </Busy>
  );
}

/** A page that is mostly a form (profile, wizard). */
export function FormPageSkeleton() {
  return (
    <Busy label="Loading…">
      <HeaderSkeleton withAction={false} />
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <Skeleton className="h-72 rounded-2xl" />
        <div className="bg-card flex flex-col gap-5 rounded-2xl border p-6">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    </Busy>
  );
}
