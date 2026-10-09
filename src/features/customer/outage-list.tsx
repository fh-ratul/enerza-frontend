"use client";

import { Building2, ChevronDown, Clock, HardHat, Siren, Users, ZapOff } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  OutagePriorityBadge,
  OutageStatusBadge,
  ReportStatusBadge,
} from "@/components/shared/badges";
import { ClearFilters } from "@/components/shared/clear-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/filter-select";
import { ListPagination } from "@/components/shared/list-pagination";
import { PageHeader } from "@/components/shared/page-header";
import { QueryError } from "@/components/shared/query-error";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { OutageTimeline } from "@/features/outages/outage-timeline";
import { ReportOutageDialog } from "@/features/outages/report-outage-dialog";
import { OUTAGE_STATUSES } from "@/features/outages/schemas";
import { useResource } from "@/hooks/use-resource";
import { useUrlState } from "@/hooks/use-url-state";
import { formatDateTime, formatDuration } from "@/lib/format";
import { OUTAGE_STATUS } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { Outage } from "@/types/api";
import { customerOutageList, OPEN_OUTAGE_STATUSES } from "./queries";

const statusOptions = OUTAGE_STATUSES.map((value) => ({
  value,
  label: OUTAGE_STATUS[value].label,
}));

const isOpen = (outage: Outage) =>
  (OPEN_OUTAGE_STATUSES as readonly string[]).includes(outage.status);

function OutageCard({ outage }: { outage: Outage }) {
  const reports = outage.reports ?? [];

  return (
    <article className="bg-card flex flex-col gap-5 rounded-2xl border p-5 sm:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-muted-foreground font-mono text-xs">{outage.feeder.code}</p>
          <h2 className="text-lg leading-snug font-semibold">{outage.feeder.name}</h2>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <OutagePriorityBadge priority={outage.priority} />
          <OutageStatusBadge status={outage.status} />
        </div>
      </header>

      {outage.description ? <p className="text-pretty">{outage.description}</p> : null}

      <dl className="text-muted-foreground grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2.5">
          <Clock className="size-4 shrink-0" aria-hidden />
          <dt className="sr-only">Started</dt>
          <dd className="nums">Started {formatDateTime(outage.startedAt)}</dd>
        </div>
        <div className="flex items-center gap-2.5">
          <Building2 className="size-4 shrink-0" aria-hidden />
          <dt className="sr-only">Substation and zone</dt>
          <dd>
            {outage.feeder.substation.name} · {outage.feeder.substation.zone.name}
          </dd>
        </div>
        <div className="flex items-center gap-2.5">
          <Users className="size-4 shrink-0" aria-hidden />
          <dt className="sr-only">Reports</dt>
          <dd>
            Reported by {outage.reportCount} {outage.reportCount === 1 ? "customer" : "customers"}
          </dd>
        </div>
        <div className="flex items-center gap-2.5">
          <HardHat className="size-4 shrink-0" aria-hidden />
          <dt className="sr-only">Technician</dt>
          <dd>
            {outage.technician
              ? `${outage.technician.user.name}${outage.technician.contactNumber ? ` · ${outage.technician.contactNumber}` : ""}`
              : isOpen(outage)
                ? "Waiting for a technician"
                : "No technician was assigned"}
          </dd>
        </div>
      </dl>

      {outage.status === "RESOLVED" ? (
        <div className="bg-success/8 border-success/20 flex flex-col gap-1 rounded-xl border p-4">
          <p className="text-sm font-medium">
            Power restored after {formatDuration(outage.durationMinutes)}
          </p>
          {outage.resolutionNote ? (
            <p className="text-muted-foreground text-sm">{outage.resolutionNote}</p>
          ) : null}
        </div>
      ) : null}

      {reports.length > 0 ? (
        <section className="flex flex-col gap-3 border-t pt-5">
          <h3 className="font-sans text-sm font-semibold tracking-normal">
            {reports.length === 1 ? "Your report" : `Your ${reports.length} reports`}
          </h3>
          <ul className="flex flex-col gap-3">
            {reports.map((report) => (
              <li key={report.id} className="flex items-start gap-3.5">
                {report.photoUrl ? (
                  <a
                    href={report.photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-muted focus-visible:ring-ring/50 relative size-14 shrink-0 overflow-hidden rounded-lg outline-none focus-visible:ring-3"
                  >
                    <Image
                      src={report.photoUrl}
                      alt="The photo attached to this report (opens full size)"
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </a>
                ) : null}
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <p className="text-sm">{report.description}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <ReportStatusBadge status={report.status} />
                    <time dateTime={report.createdAt} className="text-muted-foreground nums text-xs">
                      {formatDateTime(report.createdAt)}
                    </time>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {outage.timeline.length > 0 ? (
        <Collapsible defaultOpen={isOpen(outage)} className="border-t pt-4">
          <CollapsibleTrigger className="group focus-visible:ring-ring/50 -mx-2 flex w-[calc(100%+1rem)] items-center justify-between rounded-lg px-2 py-1.5 text-sm font-semibold outline-none focus-visible:ring-3">
            Repair timeline
            <ChevronDown
              className="text-muted-foreground size-4 transition-transform group-data-[state=open]:rotate-180"
              aria-hidden
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <OutageTimeline entries={outage.timeline} />
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </article>
  );
}

export function OutageList() {
  const { get, set } = useUrlState();
  const query = useResource(customerOutageList(get), { keepPrevious: true });
  const outages = query.data?.data;
  const hasFilter = Boolean(get("status"));

  // Other pages link here with ?report=1 to open the form straight away.
  const wantsReport = get("report") === "1";
  const [isReporting, setReporting] = useState(wantsReport);

  useEffect(() => {
    if (wantsReport) {
      set({ report: null, page: get("page") });
    }
  }, [get, set, wantsReport]);

  return (
    <>
      <PageHeader
        title="Outages"
        description="Every outage you have reported, and how far the repair has come."
        actions={
          <Button size="lg" onClick={() => setReporting(true)}>
            <Siren data-icon="inline-start" />
            Report an outage
          </Button>
        }
      />

      <div
        role="search"
        aria-label="Filter outages"
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <FilterSelect
          paramKey="status"
          label="Status"
          allLabel="Any status"
          options={statusOptions}
        />
        <ClearFilters keys={["status"]} />
      </div>

      {query.isPending ? (
        <div className="flex flex-col gap-4" aria-busy>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : query.isError && !outages ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : !outages || outages.length === 0 ? (
        hasFilter ? (
          <EmptyState
            icon={ZapOff}
            title="No outages with this status"
            description="None of your reports match the filter. Clear it to see all of them."
          />
        ) : (
          <EmptyState
            icon={ZapOff}
            title="You have not reported an outage"
            description="If your power goes out and no cut is planned, report it here. You can follow the repair from this page."
            action={
              <Button size="lg" onClick={() => setReporting(true)}>
                <Siren data-icon="inline-start" />
                Report an outage
              </Button>
            }
          />
        )
      ) : (
        <>
          <ul
            className={cn(
              "flex flex-col gap-4 transition-opacity",
              query.isPlaceholderData && "opacity-60",
            )}
            aria-busy={query.isPlaceholderData}
          >
            {outages.map((outage) => (
              <li key={outage.id}>
                <OutageCard outage={outage} />
              </li>
            ))}
          </ul>
          <ListPagination meta={query.data?.meta} />
        </>
      )}

      <ReportOutageDialog open={isReporting} onOpenChange={setReporting} />
    </>
  );
}
