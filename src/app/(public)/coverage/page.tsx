import type { Metadata } from "next";
import { Suspense } from "react";
import { CtaBand } from "@/components/marketing/cta-band";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";
import { ClearFilters } from "@/components/shared/clear-filters";
import { FilterSelect } from "@/components/shared/filter-select";
import { SearchInput } from "@/components/shared/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { CoverageResults } from "@/features/grid/coverage-results";
import { CoverageResultsSkeleton } from "@/features/grid/coverage-skeleton";
import { getGridSnapshot } from "@/features/grid/public-data";
import { formatMW } from "@/lib/format";
import { images } from "@/lib/images";
import { FEEDER_PRIORITY } from "@/lib/status";
import type { FeederPriority } from "@/types/api";

export const metadata: Metadata = {
  title: "Coverage",
  description:
    "Search the Enerza grid by area or feeder. See which feeder supplies your neighbourhood, its substation and zone, and how it is prioritised when supply is short.",
  alternates: { canonical: "/coverage" },
  openGraph: {
    title: "Coverage · Enerza",
    description: "Find the feeder that supplies your area, its substation and its zone.",
  },
};

const priorityOptions = (Object.keys(FEEDER_PRIORITY) as FeederPriority[]).map((value) => ({
  value,
  label: `${FEEDER_PRIORITY[value].label} priority`,
}));

function FiltersFallback() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Skeleton className="h-9 w-full sm:max-w-xs" />
      <Skeleton className="h-9 w-full sm:w-44" />
      <Skeleton className="h-9 w-full sm:w-44" />
    </div>
  );
}

export default async function CoveragePage({ searchParams }: PageProps<"/coverage">) {
  // The zone list for the filter comes from the cached grid snapshot, so it
  // is part of the static shell; only the results depend on the URL.
  const grid = await getGridSnapshot();
  const zoneOptions = (grid?.zones ?? []).map((zone) => ({ value: zone.id, label: zone.name }));

  return (
    <>
      <PageHero
        eyebrow="Coverage"
        title="Find the feeder that supplies your street"
        description="Search by area or feeder name. Your feeder decides which load-shedding schedule applies to you, and how early in a rotation it is cut."
        image={images.dhakaSkylineDay}
        imageClassName="object-[50%_70%]"
      >
        {grid ? (
          <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-4">
            {[
              { label: "Zones", value: grid.totals.zones },
              { label: "Feeders", value: grid.totals.feeders },
              { label: "Areas", value: grid.totals.areas },
              { label: "Connected load", value: formatMW(grid.totals.loadMW) },
            ].map((item) => (
              <div key={item.label} className="flex flex-col">
                <dt className="text-xs text-white/60">{item.label}</dt>
                <dd className="font-heading text-2xl font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </PageHero>

      <Section className="py-10! sm:py-14!">
        <div className="flex flex-col gap-8">
          {/* The filters read the URL with useSearchParams, which needs a boundary. */}
          <Suspense fallback={<FiltersFallback />}>
            <div
              role="search"
              aria-label="Filter feeders"
              className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <SearchInput placeholder="Search an area or a feeder…" />
              <FilterSelect
                paramKey="zoneId"
                label="Zone"
                allLabel="All zones"
                options={zoneOptions}
              />
              <FilterSelect
                paramKey="priority"
                label="Priority"
                allLabel="Any priority"
                options={priorityOptions}
              />
              <ClearFilters keys={["searchTerm", "zoneId", "priority"]} />
            </div>
          </Suspense>

          <Suspense fallback={<CoverageResultsSkeleton />}>
            <CoverageResults searchParams={searchParams} />
          </Suspense>
        </div>
      </Section>

      <Section className="bg-muted/40 border-y">
        <h2 className="text-2xl font-semibold sm:text-3xl">What a feeder&apos;s priority means</h2>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(FEEDER_PRIORITY) as FeederPriority[]).map((key) => (
            <div key={key} className="bg-card flex flex-col gap-2 rounded-2xl border p-5">
              <dt className="flex items-center justify-between gap-2 font-semibold">
                {FEEDER_PRIORITY[key].label}
                <span className="text-muted-foreground nums text-sm font-normal">
                  {grid ? `${grid.byPriority[key]} feeders` : null}
                </span>
              </dt>
              <dd className="text-muted-foreground text-sm leading-relaxed">
                {FEEDER_PRIORITY[key].description}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <CtaBand
        title="Found your area?"
        description="Register with your meter number to see the schedule for your feeder and report outages on it."
      />
    </>
  );
}
