"use client";

import { CircleCheck, Gauge, Timer, Wrench, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { ChartCard } from "@/components/charts/chart-card";
import { OutagePriorityBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { OverviewSkeleton } from "@/components/shared/page-skeletons";
import { QueryError } from "@/components/shared/query-error";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { OUTAGE_PRIORITIES } from "@/features/outages/schemas";
import { useResource } from "@/hooks/use-resource";
import { formatDate, formatDayMonth, formatDuration, toDhakaDay } from "@/lib/format";
import { OUTAGE_PRIORITY } from "@/lib/status";
import type { Outage } from "@/types/api";
import { technicianQueries } from "./queries";

const WEEKS_SHOWN = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The Monday (as a Dhaka calendar day) of the week a moment falls in. */
const weekStartOf = (value: string) => {
  const day = new Date(`${toDhakaDay(value)}T00:00:00Z`);
  const sinceMonday = (day.getUTCDay() + 6) % 7;

  return new Date(day.getTime() - sinceMonday * DAY_MS).toISOString().slice(0, 10);
};

const average = (values: number[]) =>
  values.length === 0 ? null : values.reduce((total, value) => total + value, 0) / values.length;

const summarise = (jobs: Outage[]) => {
  const resolved = jobs.filter(
    (job): job is Outage & { resolvedAt: string; durationMinutes: number } =>
      job.status === "RESOLVED" && job.resolvedAt !== null && job.durationMinutes !== null,
  );
  const durations = resolved.map((job) => job.durationMinutes);

  // The eight weeks up to the most recent resolved job, empty weeks included.
  const perWeek = new Map<string, number>();

  for (const job of resolved) {
    const week = weekStartOf(job.resolvedAt);

    perWeek.set(week, (perWeek.get(week) ?? 0) + 1);
  }

  const lastWeek = [...perWeek.keys()].sort().at(-1);
  const weekly = lastWeek
    ? Array.from({ length: WEEKS_SHOWN }, (_, index) => {
        const week = new Date(
          new Date(`${lastWeek}T00:00:00Z`).getTime() - (WEEKS_SHOWN - 1 - index) * 7 * DAY_MS,
        )
          .toISOString()
          .slice(0, 10);

        return { week, jobs: perWeek.get(week) ?? 0 };
      })
    : [];

  const byPriority = OUTAGE_PRIORITIES.map((priority) => {
    const matching = resolved.filter((job) => job.priority === priority);

    return {
      priority: OUTAGE_PRIORITY[priority].label,
      jobs: matching.length,
      minutes: Math.round(average(matching.map((job) => job.durationMinutes)) ?? 0),
    };
  }).filter((row) => row.jobs > 0);

  return {
    resolved,
    active: jobs.filter((job) => job.status === "ASSIGNED" || job.status === "IN_PROGRESS").length,
    averageMinutes: average(durations),
    fastestMinutes: durations.length > 0 ? Math.min(...durations) : null,
    weekly,
    byPriority,
  };
};

/** How the technician's repairs have gone, worked out from their own job history. */
export function Performance() {
  const query = useResource(technicianQueries.history);
  const stats = useMemo(() => summarise(query.data?.data ?? []), [query.data]);

  if (query.isPending) {
    return <OverviewSkeleton />;
  }

  if (query.isError && !query.data) {
    return (
      <>
        <PageHeader title="Performance" />
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Performance"
        description="Your repair record, from the latest hundred jobs assigned to you."
      />

      {stats.resolved.length === 0 ? (
        <EmptyState
          icon={Gauge}
          title="No resolved jobs yet"
          description="Once you close your first outage, your repair times and weekly totals appear here."
          action={
            <Button asChild size="lg">
              <Link href="/technician">Go to my jobs</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Jobs resolved"
              icon={CircleCheck}
              tone="success"
              value={stats.resolved.length}
              hint="Outages you closed"
            />
            <StatCard
              label="Average time to restore"
              icon={Timer}
              tone="brand"
              value={formatDuration(stats.averageMinutes)}
              hint="From the outage starting to power back"
            />
            <StatCard
              label="Fastest repair"
              icon={Zap}
              tone="volt"
              value={formatDuration(stats.fastestMinutes)}
              hint="Your quickest restoration"
            />
            <StatCard
              label="Open right now"
              icon={Wrench}
              tone={stats.active > 0 ? "warning" : "neutral"}
              value={stats.active}
              hint="Assigned or in progress"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard
              title="Jobs resolved per week"
              description={`The ${WEEKS_SHOWN} weeks up to your latest repair`}
              table={{
                columns: [{ header: "Week starting" }, { header: "Jobs", align: "right" }],
                rows: stats.weekly.map((row) => [formatDate(`${row.week}T06:00:00Z`), row.jobs]),
              }}
            >
              <SimpleBarChart
                data={stats.weekly}
                categoryKey="week"
                series={[{ key: "jobs", label: "Jobs resolved" }]}
                formatCategory={(week) => formatDayMonth(`${week}T06:00:00Z`)}
                formatValue={(value) => `${value} ${value === 1 ? "job" : "jobs"}`}
              />
            </ChartCard>

            <ChartCard
              title="Average time to restore, by priority"
              description="Minutes from the outage starting to power back"
              table={{
                columns: [
                  { header: "Priority" },
                  { header: "Jobs", align: "right" },
                  { header: "Average", align: "right" },
                ],
                rows: stats.byPriority.map((row) => [
                  row.priority,
                  row.jobs,
                  formatDuration(row.minutes),
                ]),
              }}
            >
              <SimpleBarChart
                data={stats.byPriority}
                categoryKey="priority"
                series={[{ key: "minutes", label: "Average time" }]}
                orientation="horizontal"
                categoryWidth={72}
                formatValue={(value) => formatDuration(value)}
                formatTick={(value) => `${value} min`}
              />
            </ChartCard>
          </div>

          <section
            aria-labelledby="recent-heading"
            className="bg-card flex flex-col gap-4 rounded-2xl border p-5"
          >
            <h2 id="recent-heading" className="font-sans text-base font-semibold tracking-normal">
              Latest repairs
            </h2>
            <ul className="divide-y">
              {stats.resolved.slice(0, 6).map((job) => (
                <li
                  key={job.id}
                  className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="font-medium">{job.feeder.name}</p>
                    <p className="text-muted-foreground truncate text-sm">
                      {job.resolutionNote ?? job.description ?? "No note"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <OutagePriorityBadge priority={job.priority} />
                    <span className="nums text-sm">
                      {formatDuration(job.durationMinutes)} · {formatDate(job.resolvedAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
}
