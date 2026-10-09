"use client";

import { FileClock } from "lucide-react";
import { useState } from "react";
import { RoleBadge } from "@/components/shared/badges";
import { ClearFilters } from "@/components/shared/clear-filters";
import { type Column, DataTable } from "@/components/shared/data-table";
import { DateFilter } from "@/components/shared/date-filter";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminAuditLogList,
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
  AUDIT_SORT,
} from "@/features/admin/queries";
import { useResource } from "@/hooks/use-resource";
import { useRetained } from "@/hooks/use-retained";
import { useUrlState } from "@/hooks/use-url-state";
import { formatDateTime, humanize } from "@/lib/format";
import { AUDIT_ACTION } from "@/lib/status";
import type { AuditLog } from "@/types/api";

const FILTER_KEYS = ["action", "entityType", "from", "to"];
const PAGE_SIZE = 20;

const actionOptions = AUDIT_ACTIONS.map((value) => ({ value, label: AUDIT_ACTION[value].label }));
const entityOptions = AUDIT_ENTITY_TYPES.map((value) => ({ value, label: value }));

const show = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return typeof value === "object" ? JSON.stringify(value) : String(value);
};

/** The fields an action touched, with the value before and after. */
const changesOf = (entry: AuditLog) => {
  const keys = [...new Set([...Object.keys(entry.before ?? {}), ...Object.keys(entry.after ?? {})])];

  return keys
    .map((key) => ({
      key,
      before: show(entry.before?.[key]),
      after: show(entry.after?.[key]),
    }))
    .filter((change) => change.before !== change.after);
};

function AuditDetailDialog({ entry: selected, onClose }: { entry: AuditLog | null; onClose: () => void }) {
  const entry = useRetained(selected);
  const changes = entry ? changesOf(entry) : [];

  return (
    <Dialog open={selected !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        {entry ? (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <DialogTitle className="text-lg">{entry.entityType}</DialogTitle>
                <StatusBadge tone={AUDIT_ACTION[entry.action].tone}>
                  {AUDIT_ACTION[entry.action].label}
                </StatusBadge>
              </div>
              <DialogDescription>
                {entry.actor ? `${entry.actor.name} (${entry.actor.email})` : "The system"} ·{" "}
                {formatDateTime(entry.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <dl className="bg-muted/40 grid gap-x-6 gap-y-3 rounded-xl border p-4 text-sm sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-muted-foreground text-xs">Record</dt>
                <dd className="font-mono text-xs break-all">{entry.entityId}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted-foreground text-xs">From address</dt>
                <dd className="font-mono text-xs">{entry.ipAddress ?? "Not recorded"}</dd>
              </div>
            </dl>

            {changes.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <caption className="sr-only">What changed</caption>
                  <thead className="bg-muted/50">
                    <tr className="text-muted-foreground text-left text-xs">
                      <th scope="col" className="px-3 py-2.5 font-medium">
                        Field
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-medium">
                        Before
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-medium">
                        After
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map((change) => (
                      <tr key={change.key} className="border-t align-top">
                        <th scope="row" className="px-3 py-2.5 text-left font-medium">
                          {humanize(change.key.replace(/([a-z])([A-Z])/g, "$1_$2"))}
                        </th>
                        <td className="text-muted-foreground px-3 py-2.5 font-mono text-xs break-all">
                          {change.before}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs break-all">{change.after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                This entry did not record any field values.
              </p>
            )}

            <DialogFooter>
              <Button variant="outline" size="lg" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

const columns: Column<AuditLog>[] = [
  {
    id: "createdAt",
    header: "When",
    sortable: true,
    cell: (entry) => (
      <time dateTime={entry.createdAt} className="nums">
        {formatDateTime(entry.createdAt)}
      </time>
    ),
  },
  {
    id: "actor",
    header: "Who",
    cell: (entry) =>
      entry.actor ? (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{entry.actor.name}</span>
          <span className="text-muted-foreground hidden text-xs sm:inline">{entry.actor.email}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">System</span>
      ),
  },
  {
    id: "actorRole",
    header: "Role",
    hideBelow: "lg",
    cell: (entry) =>
      entry.actorRole ? (
        <RoleBadge role={entry.actorRole} />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "action",
    header: "Action",
    sortable: true,
    cell: (entry) => (
      <StatusBadge tone={AUDIT_ACTION[entry.action].tone}>
        {AUDIT_ACTION[entry.action].label}
      </StatusBadge>
    ),
  },
  {
    id: "entityType",
    header: "Record",
    sortable: true,
    hideBelow: "sm",
    cell: (entry) => (
      <div className="flex flex-col gap-0.5">
        <span>{entry.entityType}</span>
        <span className="text-muted-foreground hidden font-mono text-xs xl:inline">
          {entry.entityId.slice(0, 13)}…
        </span>
      </div>
    ),
  },
  {
    id: "ipAddress",
    header: "Address",
    hideBelow: "xl",
    cell: (entry) => <span className="font-mono text-xs">{entry.ipAddress ?? "—"}</span>,
  },
];

/** Who changed what, and when: the record behind every sensitive action. */
export function AuditLogTable() {
  const { get } = useUrlState();
  const query = useResource(adminAuditLogList(get), { keepPrevious: true });
  const [detail, setDetail] = useState<AuditLog | null>(null);
  const hasFilter = FILTER_KEYS.some((key) => get(key));

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Every change to users, feeders, schedules, outages, bills and payments, with who made it. Entries are never edited or deleted. Open one to see what changed."
      />

      <div
        role="search"
        aria-label="Filter the audit log"
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <FilterSelect paramKey="action" label="Action" allLabel="Any action" options={actionOptions} />
        <FilterSelect
          paramKey="entityType"
          label="Record type"
          allLabel="Any record"
          options={entityOptions}
        />
        <DateFilter paramKey="from" label="From" max={get("to")} />
        <DateFilter paramKey="to" label="To" min={get("from")} />
        <ClearFilters keys={FILTER_KEYS} />
      </div>

      <DataTable
        caption="Audit log"
        columns={columns}
        rows={query.data?.data}
        getRowId={(entry) => entry.id}
        meta={query.data?.meta}
        isLoading={query.isPending}
        isFetching={query.isPlaceholderData}
        error={query.error}
        onRetry={() => query.refetch()}
        defaultSort={{ ...AUDIT_SORT, limit: PAGE_SIZE }}
        onRowClick={setDetail}
        empty={{
          icon: FileClock,
          title: hasFilter ? "No entries match these filters" : "Nothing has been logged yet",
          description: hasFilter
            ? "Widen the dates or clear the filters."
            : "Entries appear as soon as someone changes something.",
        }}
      />

      <AuditDetailDialog entry={detail} onClose={() => setDetail(null)} />
    </>
  );
}
