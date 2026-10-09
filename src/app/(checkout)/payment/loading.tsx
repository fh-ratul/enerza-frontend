import { Skeleton } from "@/components/ui/skeleton";

/** The outline of a payment result while the payment is looked up. */
export default function Loading() {
  return (
    <div
      aria-busy
      className="bg-card flex w-full max-w-lg flex-col items-center gap-7 rounded-3xl border p-6 sm:p-9"
    >
      <span className="sr-only">Checking your payment…</span>
      <Skeleton className="size-16 rounded-full" />
      <div className="flex w-full flex-col items-center gap-2.5">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Skeleton className="h-11 w-full sm:w-40" />
        <Skeleton className="h-11 w-full sm:w-40" />
      </div>
    </div>
  );
}
