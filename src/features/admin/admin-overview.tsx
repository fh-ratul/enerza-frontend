"use client";

import {
  ArrowRight,
  BadgeDollarSign,
  CircleAlert,
  FileClock,
  LightbulbOff,
  Siren,
  Sparkles,
  Timer,
  TrendingDown,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { ChartCard } from "@/components/charts/chart-card";
import { PageHeader } from "@/components/shared/page-header";
import { OverviewSkeleton } from "@/components/shared/page-skeletons";
import { QueryError } from "@/components/shared/query-error";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useResource } from "@/hooks/use-resource";
import {
  formatDate,
  formatDateTime,
  formatDayMonth,
  formatDuration,
  formatMoney,
  formatMoneyCompact,
  formatMonth,
  formatMonthShort,
  formatMW,
  formatTime,
  formatTimeRange,
  toDhakaDay,
} from "@/lib/format";
import { AUDIT_ACTION, OUTAGE_STATUS } from "@/lib/status";
import type { Bill, Outage } from "@/types/api";
import { adminQueries } from "./queries";

const TREND_DAYS = 14;
const MONTHS_SHOWN = 6;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Outages opened on each of the fourteen Dhaka days up to `today`. */
const outagesPerDay = (outages: Outage[], today: string) => {
  const counts = new Map<string, number>();

  for (const outage of outages) {
    const day = toDhakaDay(outage.startedAt);

    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  const end = new Date(`${today}T00:00:00Z`).getTime();

  return Array.from({ length: TREND_DAYS }, (_, index) => {
    const day = new Date(end - (TREND_DAYS - 1 - index) * DAY_MS).toISOString().slice(0, 10);

    return { day, outages: counts.get(day) ?? 0 };
  });
};

/** What was billed and what has been collected, per billing month (in taka). */
const billingPerMonth = (bills: Bill[]) => {
  const months = new Map<string, { billed: number; collected: number }>();

  for (const bill of bills) {
    if (bill.status === "CANCELLED") {
      continue;
    }

    const entry = months.get(bill.billingMonth) ?? { billed: 0, collected: 0 };
    const paisa = Math.round(Number(bill.totalAmount) * 100);

    entry.billed += paisa;
    entry.collected += bill.status === "PAID" ? paisa : 0;
    months.set(bill.billingMonth, entry);
  }

  return [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-MONTHS_SHOWN)
    .map(([month, { billed, collected }]) => ({
      month,
      billed: billed / 100,
      collected: collected / 100,
    }));
};

function Panel({
  id,
  title,
  href,
  linkLabel,
  children,
}: {
  id: string;
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="bg-card flex flex-col gap-4 rounded-2xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id={id} className="font-sans text-base font-semibold tracking-normal">
          {title}
        </h2>
        <Button asChild variant="ghost" size="sm">
          <Link href={href}>
            {linkLabel}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
      {children}
    </section>
  );
}

/** The control room at a glance: what is out, what is being shed, and what is owed. */
export function AdminOverview() {
  const statsQuery = useResource(adminQueries.stats, { refetchInterval: 60_000 });
  const outagesQuery = useResource(adminQueries.recentOutages);
  const billsQuery = useResource(adminQueries.recentBills);
  const auditQuery = useResource(adminQueries.latestAudit);
  const stats = statsQuery.data?.data;

  const trend = useMemo(
    () => (stats ? outagesPerDay(outagesQuery.data?.data ?? [], toDhakaDay(stats.generatedAt)) : []),
    [outagesQuery.data, stats],
  );
  const billing = useMemo(() => billingPerMonth(billsQuery.data?.data ?? []), [billsQuery.data]);

  if (statsQuery.isPending) {
    return <OverviewSkeleton />;
  }

  if (!stats) {
    return (
      <>
        <PageHeader title="Control room" />
        <QueryError error={statsQuery.error} onRetry={() => statsQuery.refetch()} />
      </>
    );
  }

  const { outages, loadShedding, reliability, billing: money, users } = stats;
  const openByStatus = (["REPORTED", "ASSIGNED", "IN_PROGRESS"] as const).map((status) => ({
    status: OUTAGE_STATUS[status].label,
    outages: outages.byStatus[status],
  }));
  const zones = reliability.byZone.map((row) => ({
    zone: row.zone.name,
    minutes: Math.round(row.saidiMinutes * 10) / 10,
    saifi: row.saifi,
    customers: row.customers,
    outages: row.outages,
  }));
  const audit = auditQuery.data?.data ?? [];

  return (
    <>
      <PageHeader
        title="Control room"
        description={`The grid right now, and the last ${stats.windowDays} days. Figures from ${formatTime(stats.generatedAt)}, refreshed every minute.`}
        actions={
          <>
            <Button asChild variant="outline" size="lg">
              <Link href="/admin/schedules/generate">
                <Sparkles data-icon="inline-start" />
                Generate rotation
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/admin/outages?status=REPORTED">
                <Siren data-icon="inline-start" />
                Dispatch outages
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Open outages"
          icon={Siren}
          tone={outages.byStatus.REPORTED > 0 ? "danger" : outages.open > 0 ? "warning" : "success"}
          value={outages.open}
          hint={
            outages.byStatus.REPORTED > 0
              ? `${outages.byStatus.REPORTED} waiting for a technician`
              : outages.open > 0
                ? "All of them have a technician"
                : "Nothing is out"
          }
        />
        <StatCard
          label="Mean time to restore"
          icon={Timer}
          tone="brand"
          value={formatDuration(outages.mttrMinutes)}
          hint={`${outages.resolvedInWindow} resolved in ${stats.windowDays} days`}
        />
        <StatCard
          label="Load being shed now"
          icon={LightbulbOff}
          tone={loadShedding.feederCount > 0 ? "warning" : "success"}
          value={formatMW(loadShedding.totalLoadMW)}
          hint={
            loadShedding.feederCount > 0
              ? `Across ${loadShedding.feederCount} ${loadShedding.feederCount === 1 ? "feeder" : "feeders"}`
              : "No feeder is being shed"
          }
        />
        <StatCard
          label={`Collected in ${formatMonth(money.month)}`}
          icon={BadgeDollarSign}
          tone="success"
          value={formatMoney(money.revenueThisMonth)}
          hint={`${money.paymentsThisMonth} ${money.paymentsThisMonth === 1 ? "payment" : "payments"}`}
        />
        <StatCard
          label="Unpaid bills"
          icon={Wallet}
          tone={money.unpaidCount > 0 ? "warning" : "success"}
          value={formatMoney(money.unpaidTotal)}
          hint={`${money.unpaidCount} ${money.unpaidCount === 1 ? "bill" : "bills"} outstanding`}
        />
        <StatCard
          label="Overdue"
          icon={CircleAlert}
          tone={money.overdueCount > 0 ? "danger" : "success"}
          value={formatMoney(money.overdueTotal)}
          hint={`${money.overdueCount} past the due date`}
        />
        <StatCard
          label="Interruption per customer"
          icon={TrendingDown}
          tone="info"
          value={formatDuration(reliability.overall.saidiMinutes)}
          hint={`SAIDI over ${stats.windowDays} days · SAIFI ${reliability.overall.saifi.toFixed(2)}`}
        />
        <StatCard
          label="Accounts"
          icon={Users}
          value={users.total}
          hint={`${users.byRole.CUSTOMER} customers · ${users.byRole.TECHNICIAN} technicians · ${users.blocked} blocked`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Outages opened per day"
          description={`The last ${TREND_DAYS} days`}
          isEmpty={outagesQuery.isPending || trend.every((row) => row.outages === 0)}
          emptyMessage={
            outagesQuery.isPending ? "Loading…" : `No outage was opened in the last ${TREND_DAYS} days.`
          }
          table={{
            columns: [{ header: "Day" }, { header: "Outages", align: "right" }],
            rows: trend.map((row) => [formatDate(`${row.day}T06:00:00Z`), row.outages]),
          }}
        >
          <SimpleBarChart
            data={trend}
            categoryKey="day"
            series={[{ key: "outages", label: "Outages opened" }]}
            formatCategory={(day) => formatDayMonth(`${day}T06:00:00Z`)}
            formatValue={(value) => `${value} ${value === 1 ? "outage" : "outages"}`}
          />
        </ChartCard>

        <ChartCard
          title="Open outages by status"
          description="Where each open outage stands"
          isEmpty={outages.open === 0}
          emptyMessage="There are no open outages."
          table={{
            columns: [{ header: "Status" }, { header: "Outages", align: "right" }],
            rows: openByStatus.map((row) => [row.status, row.outages]),
          }}
        >
          <SimpleBarChart
            data={openByStatus}
            categoryKey="status"
            series={[{ key: "outages", label: "Open outages" }]}
            orientation="horizontal"
            categoryWidth={84}
            formatValue={(value) => `${value} ${value === 1 ? "outage" : "outages"}`}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Billed and collected per month"
          description="Bills issued for each month, and how much of them has been paid"
          isEmpty={billsQuery.isPending || billing.length === 0}
          emptyMessage={billsQuery.isPending ? "Loading…" : "No bill has been issued yet."}
          table={{
            columns: [
              { header: "Month" },
              { header: "Billed", align: "right" },
              { header: "Collected", align: "right" },
            ],
            rows: billing.map((row) => [
              formatMonth(row.month),
              formatMoney(row.billed),
              formatMoney(row.collected),
            ]),
          }}
        >
          <SimpleBarChart
            data={billing}
            categoryKey="month"
            series={[
              { key: "billed", label: "Billed" },
              { key: "collected", label: "Collected" },
            ]}
            formatCategory={formatMonthShort}
            formatValue={formatMoney}
            formatTick={formatMoneyCompact}
            valueAxisWidth={56}
          />
        </ChartCard>

        <ChartCard
          title="Interruption per customer, by zone"
          description={`SAIDI: minutes without power per customer over ${stats.windowDays} days`}
          isEmpty={zones.length === 0}
          emptyMessage="No zone has customers yet."
          table={{
            columns: [
              { header: "Zone" },
              { header: "Customers", align: "right" },
              { header: "Outages", align: "right" },
              { header: "SAIFI", align: "right" },
              { header: "SAIDI", align: "right" },
            ],
            rows: zones.map((row) => [
              row.zone,
              row.customers,
              row.outages,
              row.saifi.toFixed(2),
              `${row.minutes} min`,
            ]),
          }}
        >
          <SimpleBarChart
            data={zones}
            categoryKey="zone"
            series={[{ key: "minutes", label: "SAIDI" }]}
            orientation="horizontal"
            categoryWidth={104}
            formatValue={(value) => `${value} min per customer`}
            formatTick={(value) => `${value} min`}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel
          id="shedding-heading"
          title="Being shed right now"
          href="/admin/schedules?phase=ONGOING"
          linkLabel="Schedules"
        >
          {loadShedding.feeders.length === 0 ? (
            <p className="text-muted-foreground grid min-h-28 place-items-center rounded-xl border border-dashed px-4 text-center text-sm">
              No load shedding is in progress.
            </p>
          ) : (
            <ul className="divide-y">
              {loadShedding.feeders.map((item) => (
                <li
                  key={item.scheduleId}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="truncate font-medium">{item.feeder.name}</p>
                    <p className="text-muted-foreground font-mono text-xs">{item.feeder.code}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5 text-sm">
                    <span className="nums font-medium">{formatMW(item.feeder.loadMW)}</span>
                    <span className="text-muted-foreground nums">
                      {formatTimeRange(item.startTime, item.endTime)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel id="audit-heading" title="Latest activity" href="/admin/audit-logs" linkLabel="Audit log">
          {audit.length === 0 ? (
            <p className="text-muted-foreground grid min-h-28 place-items-center rounded-xl border border-dashed px-4 text-center text-sm">
              {auditQuery.isPending ? "Loading…" : "Nothing has been logged yet."}
            </p>
          ) : (
            <ul className="divide-y">
              {audit.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-lg">
                      <FileClock className="size-4" aria-hidden />
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="truncate text-sm font-medium">
                        {entry.actor?.name ?? "System"}
                        <span className="text-muted-foreground font-normal"> · {entry.entityType}</span>
                      </p>
                      <time dateTime={entry.createdAt} className="text-muted-foreground nums text-xs">
                        {formatDateTime(entry.createdAt)}
                      </time>
                    </div>
                  </div>
                  <StatusBadge tone={AUDIT_ACTION[entry.action].tone}>
                    {AUDIT_ACTION[entry.action].label}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
