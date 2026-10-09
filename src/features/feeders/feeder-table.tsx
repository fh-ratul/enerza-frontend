"use client";

import { Pencil, Plus, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { FeederPriorityBadge } from "@/components/shared/badges";
import { ClearFilters } from "@/components/shared/clear-filters";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { adminFeederList, FEEDER_PRIORITIES, FEEDER_SORT } from "@/features/admin/queries";
import { useGrid } from "@/features/admin/use-grid";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useResource } from "@/hooks/use-resource";
import { useRetained } from "@/hooks/use-retained";
import { useUrlState } from "@/hooks/use-url-state";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/resources";
import { formatMW } from "@/lib/format";
import { FEEDER_PRIORITY } from "@/lib/status";
import type { Feeder } from "@/types/api";
import { FeederFormDialog } from "./feeder-form-dialog";

const FILTER_KEYS = ["searchTerm", "zoneId", "priority", "isActive"];

const priorityOptions = FEEDER_PRIORITIES.map((value) => ({
  value,
  label: `${FEEDER_PRIORITY[value].label} priority`,
}));

const serviceOptions = [
  { value: "true", label: "In service" },
  { value: "false", label: "Out of service" },
];

/** The grid's feeders: search, filter, sort, add, edit and remove. */
export function FeederTable() {
  const { get } = useUrlState();
  const query = useResource(adminFeederList(get), { keepPrevious: true });
  const grid = useGrid();
  const [editing, setEditing] = useState<Feeder | "new" | null>(null);
  const [removing, setRemoving] = useState<Feeder | null>(null);
  const shownRemoving = useRetained(removing);

  const remove = useApiMutation<null, string>({
    mutationFn: (id) => api.delete<null>(`/feeders/${id}`),
    invalidate: [queryKeys.feeders, queryKeys.adminStats],
    onSuccess: () => setRemoving(null),
  });

  const hasFilter = FILTER_KEYS.some((key) => get(key));

  const columns: Column<Feeder>[] = [
    {
      id: "code",
      header: "Feeder",
      sortable: true,
      cell: (feeder) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{feeder.name}</span>
          <span className="text-muted-foreground font-mono text-xs">{feeder.code}</span>
        </div>
      ),
    },
    {
      id: "substation",
      header: "Substation",
      hideBelow: "md",
      cell: (feeder) => (
        <div className="flex flex-col gap-0.5">
          <span>{feeder.substation.name}</span>
          <span className="text-muted-foreground text-xs">{feeder.substation.zone.name}</span>
        </div>
      ),
    },
    {
      id: "loadMW",
      header: "Load",
      sortable: true,
      align: "right",
      cell: (feeder) => <span className="nums">{formatMW(feeder.loadMW)}</span>,
    },
    {
      id: "priority",
      header: "Priority",
      sortable: true,
      hideBelow: "sm",
      cell: (feeder) => <FeederPriorityBadge priority={feeder.priority} />,
    },
    {
      id: "areas",
      header: "Areas",
      hideBelow: "lg",
      className: "max-w-64",
      cell: (feeder) =>
        feeder.areas.length > 0 ? (
          <span className="line-clamp-2 text-sm whitespace-normal">
            {feeder.areas.map((area) => area.name).join(", ")}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">None</span>
        ),
    },
    {
      id: "isActive",
      header: "Service",
      hideBelow: "sm",
      cell: (feeder) => (
        <StatusBadge tone={feeder.isActive ? "success" : "neutral"} dot>
          {feeder.isActive ? "In service" : "Out of service"}
        </StatusBadge>
      ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (feeder) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditing(feeder)}
            aria-label={`Edit ${feeder.name}`}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRemoving(feeder)}
            aria-label={`Remove ${feeder.name}`}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Feeders"
        description="Every feeder on the grid, with the areas it supplies and how it is prioritised when supply is short."
        actions={
          <Button size="lg" onClick={() => setEditing("new")} disabled={grid.substations.length === 0}>
            <Plus data-icon="inline-start" />
            Add feeder
          </Button>
        }
      />

      <div
        role="search"
        aria-label="Filter feeders"
        className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <SearchInput placeholder="Search a feeder or an area…" />
        <FilterSelect paramKey="zoneId" label="Zone" allLabel="All zones" options={grid.zoneOptions} />
        <FilterSelect
          paramKey="priority"
          label="Priority"
          allLabel="Any priority"
          options={priorityOptions}
        />
        <FilterSelect
          paramKey="isActive"
          label="Service"
          allLabel="Any service state"
          options={serviceOptions}
        />
        <ClearFilters keys={FILTER_KEYS} />
      </div>

      <DataTable
        caption="Feeders"
        columns={columns}
        rows={query.data?.data}
        getRowId={(feeder) => feeder.id}
        meta={query.data?.meta}
        isLoading={query.isPending}
        isFetching={query.isPlaceholderData}
        error={query.error}
        onRetry={() => query.refetch()}
        defaultSort={FEEDER_SORT}
        empty={{
          icon: Zap,
          title: hasFilter ? "No feeders match these filters" : "No feeders yet",
          description: hasFilter
            ? "Try a different search, or clear the filters to see the whole grid."
            : "Add the first feeder to start scheduling and billing against it.",
        }}
      />

      <FeederFormDialog
        target={editing}
        substations={grid.substations}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => (!open && !remove.isPending ? setRemoving(null) : undefined)}
        title={`Remove ${shownRemoving?.name ?? "this feeder"}?`}
        description="The feeder and its areas disappear from the grid, the coverage page and every picker. Its past schedules, outages and bills are kept. A feeder with customers or open work on it cannot be removed."
        confirmLabel="Remove feeder"
        destructive
        isPending={remove.isPending}
        onConfirm={() => (removing ? remove.mutate(removing.id) : undefined)}
      />
    </>
  );
}
