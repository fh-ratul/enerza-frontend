"use client";

import { Ban, CalendarClock, Plus, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SchedulePhaseBadge, ScheduleTypeBadge } from "@/components/shared/badges";
import { ClearFilters } from "@/components/shared/clear-filters";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { DateFilter } from "@/components/shared/date-filter";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  adminScheduleList,
  SCHEDULE_PHASES,
  SCHEDULE_SORT,
  SCHEDULE_STATUSES,
  SCHEDULE_TYPES,
} from "@/features/admin/queries";
import { useGrid } from "@/features/admin/use-grid";
import { StatusNoteDialog } from "@/features/outages/status-note-dialog";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useResource } from "@/hooks/use-resource";
import { useRetained } from "@/hooks/use-retained";
import { useUrlState } from "@/hooks/use-url-state";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/resources";
import { formatShortDate, formatTimeRange, humanize } from "@/lib/format";
import { SCHEDULE_PHASE, SCHEDULE_TYPE } from "@/lib/status";
import type { Schedule } from "@/types/api";
import { ScheduleFormDialog } from "./schedule-form-dialog";

const FILTER_KEYS = ["type", "status", "phase", "zoneId", "from", "to"];

const typeOptions = SCHEDULE_TYPES.map((value) => ({ value, label: SCHEDULE_TYPE[value].label }));
const statusOptions = SCHEDULE_STATUSES.map((value) => ({ value, label: humanize(value) }));
const phaseOptions = SCHEDULE_PHASES.map((value) => ({ value, label: SCHEDULE_PHASE[value].label }));

type StatusChange = { id: string; status: "PUBLISHED" | "CANCELLED"; reason?: string };

/** Every schedule on the grid: filter, create drafts, publish and cancel. */
export function ScheduleTable() {
  const { get } = useUrlState();
  const query = useResource(adminScheduleList(get), { keepPrevious: true });
  const grid = useGrid();
  const [isCreating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState<Schedule | null>(null);
  const [cancelling, setCancelling] = useState<Schedule | null>(null);
  const shownPublishing = useRetained(publishing);
  const shownCancelling = useRetained(cancelling);

  const change = useApiMutation<Schedule, StatusChange>({
    mutationFn: ({ id, ...body }) => api.patch<Schedule>(`/schedules/${id}/status`, body),
    invalidate: [queryKeys.schedules, queryKeys.adminStats],
    onSuccess: () => {
      setPublishing(null);
      setCancelling(null);
    },
  });

  const hasFilter = FILTER_KEYS.some((key) => get(key));
  // A draft is dropped without ceremony; cancelling a published one needs a reason.
  const cancelsDraft = cancelling?.status === "DRAFT";

  const columns: Column<Schedule>[] = [
    {
      id: "startTime",
      header: "Window",
      sortable: true,
      cell: (schedule) => (
        <div className="nums flex flex-col gap-0.5">
          <span className="font-medium">{formatShortDate(schedule.startTime)}</span>
          <span className="text-muted-foreground text-sm">
            {formatTimeRange(schedule.startTime, schedule.endTime)}
          </span>
        </div>
      ),
    },
    {
      id: "feeder",
      header: "Feeder",
      cell: (schedule) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{schedule.feeder.name}</span>
          <span className="text-muted-foreground text-xs">
            <span className="font-mono">{schedule.feeder.code}</span> ·{" "}
            {schedule.feeder.substation.zone.name}
          </span>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      sortable: true,
      hideBelow: "md",
      cell: (schedule) => <ScheduleTypeBadge type={schedule.type} />,
    },
    {
      id: "status",
      header: "State",
      sortable: true,
      cell: (schedule) => <SchedulePhaseBadge phase={schedule.phase} />,
    },
    {
      id: "reason",
      header: "Reason",
      hideBelow: "xl",
      className: "max-w-72",
      cell: (schedule) => (
        <span className="text-muted-foreground line-clamp-2 text-sm whitespace-normal">
          {schedule.status === "CANCELLED" && schedule.cancelReason
            ? `Cancelled: ${schedule.cancelReason}`
            : (schedule.reason ?? "—")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (schedule) => {
        const canCancel =
          schedule.phase === "DRAFT" || schedule.phase === "UPCOMING" || schedule.phase === "ONGOING";

        return (
          <div className="flex justify-end gap-1.5">
            {schedule.status === "DRAFT" ? (
              <Button size="sm" onClick={() => setPublishing(schedule)}>
                <Send data-icon="inline-start" />
                Publish
              </Button>
            ) : null}
            {canCancel ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setCancelling(schedule)}
                aria-label={`Cancel the schedule on ${schedule.feeder.name}`}
              >
                <Ban />
              </Button>
            ) : null}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Schedules"
        description="Load shedding and maintenance across the grid. Drafts are yours alone; publishing a schedule emails the customers on its feeder."
        actions={
          <>
            <Button asChild variant="outline" size="lg">
              <Link href="/admin/schedules/generate">
                <Sparkles data-icon="inline-start" />
                Generate rotation
              </Link>
            </Button>
            <Button size="lg" onClick={() => setCreating(true)} disabled={grid.feeders.length === 0}>
              <Plus data-icon="inline-start" />
              New schedule
            </Button>
          </>
        }
      />

      <div
        role="search"
        aria-label="Filter schedules"
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <FilterSelect paramKey="phase" label="Phase" allLabel="Any phase" options={phaseOptions} />
        <FilterSelect paramKey="status" label="Status" allLabel="Any status" options={statusOptions} />
        <FilterSelect paramKey="type" label="Type" allLabel="Any type" options={typeOptions} />
        <FilterSelect paramKey="zoneId" label="Zone" allLabel="All zones" options={grid.zoneOptions} />
        <DateFilter paramKey="from" label="From" max={get("to")} />
        <DateFilter paramKey="to" label="To" min={get("from")} />
        <ClearFilters keys={FILTER_KEYS} />
      </div>

      <DataTable
        caption="Schedules"
        columns={columns}
        rows={query.data?.data}
        getRowId={(schedule) => schedule.id}
        meta={query.data?.meta}
        isLoading={query.isPending}
        isFetching={query.isPlaceholderData}
        error={query.error}
        onRetry={() => query.refetch()}
        defaultSort={SCHEDULE_SORT}
        empty={{
          icon: CalendarClock,
          title: hasFilter ? "No schedules match these filters" : "No schedules yet",
          description: hasFilter
            ? "Widen the dates or clear the filters."
            : "Create a schedule by hand, or let the generator plan a fair rotation for a shortfall.",
        }}
      />

      <ScheduleFormDialog open={isCreating} onOpenChange={setCreating} feeders={grid.feeders} />

      <ConfirmDialog
        open={publishing !== null}
        onOpenChange={(open) => (!open && !change.isPending ? setPublishing(null) : undefined)}
        title="Publish this schedule?"
        description={
          shownPublishing
            ? `Customers on ${shownPublishing.feeder.name} will see ${SCHEDULE_TYPE[shownPublishing.type].label.toLowerCase()} on ${formatShortDate(shownPublishing.startTime)}, ${formatTimeRange(shownPublishing.startTime, shownPublishing.endTime)}, and are told by email.`
            : ""
        }
        confirmLabel="Publish"
        isPending={change.isPending}
        onConfirm={() =>
          publishing ? change.mutate({ id: publishing.id, status: "PUBLISHED" }) : undefined
        }
      />

      <ConfirmDialog
        open={cancelling !== null && cancelsDraft}
        onOpenChange={(open) => (!open && !change.isPending ? setCancelling(null) : undefined)}
        title="Discard this draft?"
        description={`The draft on ${shownCancelling?.feeder.name ?? "this feeder"} was never published, so no customer is told.`}
        confirmLabel="Discard draft"
        destructive
        isPending={change.isPending}
        onConfirm={() =>
          cancelling ? change.mutate({ id: cancelling.id, status: "CANCELLED" }) : undefined
        }
      />

      <StatusNoteDialog
        open={cancelling !== null && !cancelsDraft}
        onOpenChange={(open) => (!open ? setCancelling(null) : undefined)}
        title="Cancel this published schedule"
        description={`Customers on ${shownCancelling?.feeder.name ?? "this feeder"} were told about this cut. They are emailed that it is off, with your reason.`}
        noteLabel="Why is it cancelled?"
        placeholder="e.g. Supply has recovered, so the cut is no longer needed."
        confirmLabel="Cancel schedule"
        destructive
        minLength={3}
        maxLength={300}
        isPending={change.isPending}
        onConfirm={(reason) =>
          cancelling ? change.mutate({ id: cancelling.id, status: "CANCELLED", reason }) : undefined
        }
      />
    </>
  );
}
