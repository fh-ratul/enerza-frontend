"use client";

import { Ban, Plus, Siren, UserPlus } from "lucide-react";
import { useState } from "react";
import { OutagePriorityBadge, OutageStatusBadge } from "@/components/shared/badges";
import { ClearFilters } from "@/components/shared/clear-filters";
import { type Column, DataTable } from "@/components/shared/data-table";
import { DateFilter } from "@/components/shared/date-filter";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminOutageList, OUTAGE_SORT } from "@/features/admin/queries";
import { useGrid } from "@/features/admin/use-grid";
import { useResource } from "@/hooks/use-resource";
import { useRetained } from "@/hooks/use-retained";
import { useUrlState } from "@/hooks/use-url-state";
import { formatDateTime, formatDuration } from "@/lib/format";
import { OUTAGE_PRIORITY, OUTAGE_STATUS } from "@/lib/status";
import type { Outage } from "@/types/api";
import { AssignDialog } from "./assign-dialog";
import { IncidentDialog } from "./incident-dialog";
import { OutageTimeline } from "./outage-timeline";
import { OUTAGE_PRIORITIES, OUTAGE_STATUSES } from "./schemas";
import { StatusNoteDialog } from "./status-note-dialog";
import { useOutageStatus } from "./use-outage-status";

const FILTER_KEYS = ["status", "priority", "zoneId", "from", "to"];

const statusOptions = OUTAGE_STATUSES.map((value) => ({ value, label: OUTAGE_STATUS[value].label }));
const priorityOptions = OUTAGE_PRIORITIES.map((value) => ({
  value,
  label: `${OUTAGE_PRIORITY[value].label} priority`,
}));

// What the control room may do from each status (the API's OUTAGE_TRANSITIONS).
const canAssign = (outage: Outage) =>
  outage.status === "REPORTED" || outage.status === "ASSIGNED" || outage.status === "IN_PROGRESS";
const canCancel = (outage: Outage) => outage.status === "REPORTED" || outage.status === "ASSIGNED";

type DetailProps = {
  outage: Outage | null;
  onClose: () => void;
  onAssign: (outage: Outage) => void;
  onCancel: (outage: Outage) => void;
};

function OutageDetailDialog({ outage: selected, onClose, onAssign, onCancel }: DetailProps) {
  const outage = useRetained(selected);

  return (
    <Dialog open={selected !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        {outage ? (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <DialogTitle className="text-lg">{outage.feeder.name}</DialogTitle>
                <OutagePriorityBadge priority={outage.priority} />
                <OutageStatusBadge status={outage.status} />
              </div>
              <DialogDescription>
                <span className="font-mono">{outage.feeder.code}</span> ·{" "}
                {outage.feeder.substation.name} · {outage.feeder.substation.zone.name}
              </DialogDescription>
            </DialogHeader>

            {outage.description ? <p className="text-pretty">{outage.description}</p> : null}

            <dl className="bg-muted/40 grid gap-x-6 gap-y-3 rounded-xl border p-4 text-sm sm:grid-cols-2">
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted-foreground text-xs">Started</dt>
                <dd className="nums font-medium">{formatDateTime(outage.startedAt)}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted-foreground text-xs">Customer reports</dt>
                <dd className="nums font-medium">{outage.reportCount}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted-foreground text-xs">Technician</dt>
                <dd className="font-medium">
                  {outage.technician
                    ? `${outage.technician.user.name}${outage.technician.contactNumber ? ` · ${outage.technician.contactNumber}` : ""}`
                    : "Not assigned"}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted-foreground text-xs">
                  {outage.status === "RESOLVED" ? "Restored after" : "Resolved"}
                </dt>
                <dd className="nums font-medium">
                  {outage.status === "RESOLVED" ? formatDuration(outage.durationMinutes) : "Not yet"}
                </dd>
              </div>
            </dl>

            {outage.resolutionNote ? (
              <p className="text-sm">
                <span className="font-medium">Closing note: </span>
                {outage.resolutionNote}
              </p>
            ) : null}

            <section className="flex flex-col gap-4 border-t pt-4">
              <h3 className="font-sans text-sm font-semibold tracking-normal">Timeline</h3>
              <OutageTimeline entries={outage.timeline} />
            </section>

            <DialogFooter>
              {canCancel(outage) ? (
                <Button variant="outline" size="lg" onClick={() => onCancel(outage)}>
                  <Ban data-icon="inline-start" />
                  Cancel outage
                </Button>
              ) : null}
              {canAssign(outage) ? (
                <Button size="lg" onClick={() => onAssign(outage)}>
                  <UserPlus data-icon="inline-start" />
                  {outage.technician ? "Reassign" : "Assign"}
                </Button>
              ) : (
                <Button variant="outline" size="lg" onClick={onClose}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/** The control room's dispatch board: every outage, who has it, and what to do next. */
export function OutageBoard() {
  const { get } = useUrlState();
  const query = useResource(adminOutageList(get), { keepPrevious: true, refetchInterval: 60_000 });
  const grid = useGrid();
  const [detail, setDetail] = useState<Outage | null>(null);
  const [assigning, setAssigning] = useState<Outage | null>(null);
  const [cancelling, setCancelling] = useState<Outage | null>(null);
  const [isLogging, setLogging] = useState(false);
  const shownCancelling = useRetained(cancelling);
  const cancel = useOutageStatus({ onSuccess: () => setCancelling(null) });
  const hasFilter = FILTER_KEYS.some((key) => get(key));

  const columns: Column<Outage>[] = [
    {
      id: "feeder",
      header: "Outage",
      cell: (outage) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{outage.feeder.name}</span>
          <span className="text-muted-foreground text-xs">
            <span className="font-mono">{outage.feeder.code}</span> ·{" "}
            {outage.feeder.substation.zone.name}
          </span>
        </div>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      sortable: true,
      hideBelow: "md",
      cell: (outage) => <OutagePriorityBadge priority={outage.priority} />,
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      cell: (outage) => <OutageStatusBadge status={outage.status} />,
    },
    {
      id: "reportCount",
      header: "Reports",
      sortable: true,
      align: "right",
      hideBelow: "lg",
      cell: (outage) => <span className="nums">{outage.reportCount}</span>,
    },
    {
      id: "startedAt",
      header: "Started",
      sortable: true,
      hideBelow: "lg",
      cell: (outage) => <span className="nums">{formatDateTime(outage.startedAt)}</span>,
    },
    {
      id: "technician",
      header: "Technician",
      hideBelow: "sm",
      cell: (outage) =>
        outage.technician ? (
          outage.technician.user.name
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (outage) => (
        <div className="flex justify-end gap-1.5">
          {canAssign(outage) ? (
            <Button
              size="sm"
              variant={outage.technician ? "outline" : "default"}
              onClick={(event) => {
                event.stopPropagation();
                setAssigning(outage);
              }}
            >
              {outage.technician ? "Reassign" : "Assign"}
            </Button>
          ) : null}
          {canCancel(outage) ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Cancel the outage on ${outage.feeder.name}`}
              onClick={(event) => {
                event.stopPropagation();
                setCancelling(outage);
              }}
            >
              <Ban />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Outages"
        description="Every outage on the grid. Assign the ones that are waiting, and open a row to follow its timeline."
        actions={
          <Button size="lg" onClick={() => setLogging(true)} disabled={grid.feeders.length === 0}>
            <Plus data-icon="inline-start" />
            Log incident
          </Button>
        }
      />

      <div
        role="search"
        aria-label="Filter outages"
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <FilterSelect paramKey="status" label="Status" allLabel="Any status" options={statusOptions} />
        <FilterSelect
          paramKey="priority"
          label="Priority"
          allLabel="Any priority"
          options={priorityOptions}
        />
        <FilterSelect paramKey="zoneId" label="Zone" allLabel="All zones" options={grid.zoneOptions} />
        <DateFilter paramKey="from" label="From" max={get("to")} />
        <DateFilter paramKey="to" label="To" min={get("from")} />
        <ClearFilters keys={FILTER_KEYS} />
      </div>

      <DataTable
        caption="Outages"
        columns={columns}
        rows={query.data?.data}
        getRowId={(outage) => outage.id}
        meta={query.data?.meta}
        isLoading={query.isPending}
        isFetching={query.isPlaceholderData}
        error={query.error}
        onRetry={() => query.refetch()}
        defaultSort={OUTAGE_SORT}
        onRowClick={setDetail}
        empty={{
          icon: Siren,
          title: hasFilter ? "No outages match these filters" : "No outages have been reported",
          description: hasFilter
            ? "Widen the dates or clear the filters."
            : "When a customer reports an outage, or you log an incident, it appears here.",
        }}
      />

      <OutageDetailDialog
        outage={detail}
        onClose={() => setDetail(null)}
        onAssign={(outage) => {
          setDetail(null);
          setAssigning(outage);
        }}
        onCancel={(outage) => {
          setDetail(null);
          setCancelling(outage);
        }}
      />
      <AssignDialog outage={assigning} onClose={() => setAssigning(null)} />
      <IncidentDialog open={isLogging} onOpenChange={setLogging} feeders={grid.feeders} />
      <StatusNoteDialog
        open={cancelling !== null}
        onOpenChange={(open) => (!open ? setCancelling(null) : undefined)}
        title="Cancel this outage"
        description={`For a report that turned out to be a false alarm or a duplicate. Everyone who reported the outage on ${shownCancelling?.feeder.name ?? "this feeder"} is told, with your note.`}
        noteLabel="Why is it cancelled?"
        placeholder="e.g. Checked on site: supply is normal, the fault was inside the customer's premises."
        confirmLabel="Cancel outage"
        destructive
        isPending={cancel.isPending}
        onConfirm={(note) =>
          cancelling ? cancel.mutate({ id: cancelling.id, status: "CANCELLED", note }) : undefined
        }
      />
    </>
  );
}
