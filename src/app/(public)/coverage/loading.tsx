import { Container } from "@/components/marketing/section";
import { Skeleton } from "@/components/ui/skeleton";
import { CoverageResultsSkeleton } from "@/features/grid/coverage-skeleton";

export default function CoverageLoading() {
  return (
    <>
      <div className="bg-ink">
        <Container className="flex flex-col gap-5 py-16 sm:py-20 lg:py-24">
          <Skeleton className="h-3 w-24 bg-white/10" />
          <Skeleton className="h-12 w-full max-w-xl bg-white/10" />
          <Skeleton className="h-5 w-full max-w-lg bg-white/10" />
        </Container>
      </div>
      <Container className="flex flex-col gap-8 py-10 sm:py-14">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-9 w-full sm:max-w-xs" />
          <Skeleton className="h-9 w-full sm:w-44" />
          <Skeleton className="h-9 w-full sm:w-44" />
        </div>
        <CoverageResultsSkeleton />
      </Container>
    </>
  );
}
