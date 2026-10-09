"use client";

import {
  Building2,
  CircleCheck,
  ClipboardCheck,
  Clock,
  HardHat,
  MapPin,
  Play,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { OutagePriorityBadge, OutageStatusBadge } from "@/components/shared/badges";
import { ClearFilters } from "@/components/shared/clear-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListPagination } from "@/components/shared/list-pagination";
import { PageHeader } from "@/components/shared/page-header";
import { QueryError } from "@/components/shared/query-error";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { OutageTimeline } from "@/features/outages/outage-timeline";
import { OUTAGE_PRIORITIES } from "@/features/outages/schemas";
import { StatusNoteDialog } from "@/features/outages/status-note-dialog";
import { useOutageStatus } from "@/features/outages/use-outage-status";
import { useAuth } from "@/hooks/use-auth";
import { useNow } from "@/hooks/use-now";
import { useResource } from "@/hooks/use-resource";
import { useUrlState } from "@/hooks/use-url-state";
import { formatDateTime, formatDuration, formatRelative } from "@/lib/format";
import { OUTAGE_PRIORITY, OUTAGE_STATUS } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { Outage } from "@/types/api";
import { technicianJobList, technicianQueries } from "./queries";
import { useDuty } from "./use-duty";

// A technician never sees a job before it is assigned to them.
const statusOptions = (["ASSIGNED", "IN_PROGRESS", "RESOLVED", "CANCELLED"] as const).map(
  (value) => ({ value, label: OUTAGE_STATUS[value].label }),
);

const priorityOptions = OUTAGE_PRIORITIES.map((value) => ({
  value,
  label: `${OUTAGE_PRIORITY[value].label} priority`,
}));

type JobCardProps = {
  job: Outage;
  now: Date | null;
  isBusy: boolean;
  onStart: (job: Outage) => void;
  onResolve: (job: Outage) => void;
};

function JobCard({ job, now, isBusy, onStart, onResolve }: JobCardProps) {
  const isActive = job.status === "ASSIGNED" || job.status === "IN_PROGRESS";

  return (
    <article
      className={cn(
        "bg-card flex flex-col gap-5 rounded-2xl border p-5 sm:p-6",
        job.status === "IN_PROGRESS" && "border-brand/40",
      )}
    >
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-muted-foreground font-mono text-xs">{job.feeder.code}</p>
          <h2 className="text-lg leading-snug font-semibold">{job.feeder.name}</h2>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <OutagePriorityBadge priority={job.priority} />
          <OutageStatusBadge status={job.status} />
        </div>
      </header>

      {job.description ? <p className="text-pretty">{job.description}</p> : null}

      <dl className="text-muted-foreground grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2.5">
          <Building2 className="size-4 shrink-0" aria-hidden />
          <dt className="sr-only">Substation and zone</dt>
          <dd>
            {job.feeder.substation.name} · {job.feeder.substation.zone.name}
          </dd>
        </div>
        <div className="flex items-center gap-2.5">
          <Users className="size-4 shrink-0" aria-hidden />
          <dt className="sr-only">Reports</dt>
          <dd>
            {job.reportCount} customer {job.reportCount === 1 ? "report" : "reports"}
          </dd>
        </div>
        <div className="flex items-center gap-2.5">
          <Clock className="size-4 shrink-0" aria-hidden />
          <dt className="sr-only">Power out since</dt>
          <dd className="nums">
            Out since {formatDateTime(job.startedAt)}
            {isActive && now ? ` (${formatRelative(job.startedAt, now)})` : ""}
          </dd>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin className="size-4 shrink-0" aria-hidden />
          <dt className="sr-only">Assigned</dt>
          <dd className="nums">
            {job.assignedAt ? `Assigned ${formatDateTime(job.assignedAt)}` : "Not assigned"}
          </dd>
        </div>
      </dl>

      {job.status === "RESOLVED" ? (
        <div className="bg-success/8 border-success/20 flex flex-col gap-1 rounded-xl border p-4">
          <p className="text-sm font-medium">Restored in {formatDuration(job.durationMinutes)}</p>
          {job.resolutionNote ? (
            <p className="text-muted-foreground text-sm">{job.resolutionNote}</p>
          ) : null}
        </div>
      ) : null}

      <details className="group border-t pt-4">
        <summary className="focus-visible:ring-ring/50 -mx-2 cursor-pointer list-none rounded-lg px-2 py-1.5 text-sm font-semibold outline-none focus-visible:ring-3 [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Show the timeline</span>
          <span className="hidden group-open:inline">Hide the timeline</span>
        </summary>
        <div className="pt-4">
          <OutageTimeline entries={job.timeline} />
        </div>
      </details>

      {isActive ? (
        <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-end">
          {job.status === "ASSIGNED" ? (
            <Button size="lg" onClick={() => onStart(job)} disabled={isBusy}>
              <Play data-icon="inline-start" />
              Start work
            </Button>
          ) : (
            <Button size="lg" onClick={() => onResolve(job)} disabled={isBusy}>
              <CircleCheck data-icon="inline-start" />
              Mark as resolved
            </Button>
          )}
        </div>
      ) : null}
    </article>
  );
}

export function JobBoard() {
  const { user } = useAuth();
  const { get } = useUrlState();
  const now = useNow();
  const query = useResource(technicianJobList(get), { keepPrevious: true });
  const history = useResource(technicianQueries.history);
  const duty = useDuty();
  const [resolving, setResolving] = useState<Outage | null>(null);
  const status = useOutageStatus({ onSuccess: () => setResolving(null) });

  const technician = user?.technician;
  const jobs = query.data?.data;
  const all = history.data?.data ?? [];
  const inProgress = all.filter((job) => job.status === "IN_PROGRESS").length;
  const waiting = all.filter((job) => job.status === "ASSIGNED").length;
  const resolved = all.filter((job) => job.status === "RESOLVED").length;
  const hasFilter = Boolean(get("status") || get("priority"));

  return (
    <>
      <PageHeader
        title="My jobs"
        description={
          technician
            ? `Outages assigned to you in ${technician.zone.name}. Start a job when you reach the site, and close it with a note once power is back.`
            : "Outages assigned to you."
        }
        actions={
          technician ? (
            <label className="bg-card flex items-center gap-3 rounded-xl border px-4 py-2.5">
              <span className="flex flex-col">
                <span className="text-sm font-medium">
                  {technician.isAvailable ? "On duty" : "Off duty"}
                </span>
                <span className="text-muted-foreground text-xs">
                  {technician.isAvailable ? "You can be given jobs" : "No new jobs"}
                </span>
              </span>
              <Switch
                checked={technician.isAvailable}
                onCheckedChange={(checked) => duty.mutate(checked)}
                disabled={duty.isPending}
                aria-label="On duty"
              />
            </label>
          ) : null
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {history.isPending || !technician ? (
          Array.from({ length: 4 }, (_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              label="Active jobs"
              icon={HardHat}
              tone={technician.activeJobCount >= technician.maxActiveJobs ? "warning" : "brand"}
              value={`${technician.activeJobCount} of ${technician.maxActiveJobs}`}
              hint={
                technician.activeJobCount >= technician.maxActiveJobs
                  ? "At capacity: no new jobs until one closes"
                  : "Your limit of open jobs"
              }
            />
            <StatCard
              label="Waiting to start"
              icon={ClipboardCheck}
              tone={waiting > 0 ? "info" : "neutral"}
              value={waiting}
              hint="Assigned, not yet on site"
            />
            <StatCard
              label="In progress"
              icon={Wrench}
              tone={inProgress > 0 ? "warning" : "neutral"}
              value={inProgress}
              hint="You are working on these"
            />
            <StatCard
              label="Resolved"
              icon={CircleCheck}
              tone="success"
              value={resolved}
              hint="Among your latest 100 jobs"
            />
          </>
        )}
      </div>

      <div
        role="search"
        aria-label="Filter jobs"
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <FilterSelect paramKey="status" label="Status" allLabel="Any status" options={statusOptions} />
        <FilterSelect
          paramKey="priority"
          label="Priority"
          allLabel="Any priority"
          options={priorityOptions}
        />
        <ClearFilters keys={["status", "priority"]} />
      </div>

      {query.isPending ? (
        <div className="flex flex-col gap-4" aria-busy>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : query.isError && !jobs ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : !jobs || jobs.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title={hasFilter ? "No jobs match these filters" : "No jobs assigned to you"}
          description={
            hasFilter
              ? "Clear the filters to see every job you have been given."
              : "When the control room assigns you an outage, it appears here and you get an email."
          }
        />
      ) : (
        <>
          <ul
            className={cn(
              "flex flex-col gap-4 transition-opacity",
              query.isPlaceholderData && "opacity-60",
            )}
          >
            {jobs.map((job) => (
              <li key={job.id}>
                <JobCard
                  job={job}
                  now={now}
                  isBusy={status.isPending}
                  onStart={(target) => status.mutate({ id: target.id, status: "IN_PROGRESS" })}
                  onResolve={setResolving}
                />
              </li>
            ))}
          </ul>
          <ListPagination meta={query.data?.meta} />
        </>
      )}

      <StatusNoteDialog
        open={resolving !== null}
        onOpenChange={(open) => (!open ? setResolving(null) : undefined)}
        title="Mark this outage as resolved"
        description="Confirm that power is back on the feeder. Every customer who reported it is told, with your note."
        noteLabel="What fixed it?"
        placeholder="e.g. Replaced the blown fuse on the 11 kV line and re-energised the feeder."
        confirmLabel="Resolve outage"
        isPending={status.isPending}
        onConfirm={(note) =>
          resolving ? status.mutate({ id: resolving.id, status: "RESOLVED", note }) : undefined
        }
      />
    </>
  );
}
