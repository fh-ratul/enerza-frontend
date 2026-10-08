"use client";

import {
  ArrowRight,
  Building2,
  CalendarClock,
  CalendarX,
  Gauge,
  MapPin,
  Receipt,
  Siren,
  UserCog,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { ChartCard } from "@/components/charts/chart-card";
import {
  FeederPriorityBadge,
  SchedulePhaseBadge,
  ScheduleTypeBadge,
} from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { QueryError } from "@/components/shared/query-error";
import { StatCard, StatCardSkeleton } from "@/components/shared/stat-card";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useResource } from "@/hooks/use-resource";
import {
  formatMoney,
  formatMonth,
  formatMonthShort,
  formatNumber,
  formatShortDate,
  formatTimeRange,
} from "@/lib/format";
import { PowerStatus } from "./power-status";
import { customerQueries, OPEN_OUTAGE_STATUSES } from "./queries";

/** Greets a customer who has just registered, then tidies the URL. */
const useWelcomeToast = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("welcome")) {
      toast.success("Your account is ready", {
        description: "This is your dashboard. Your feeder's schedule is already here.",
      });
      router.replace(pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);
};

export function CustomerOverview() {
  useWelcomeToast();

  const { user } = useAuth();
  const isProfileComplete = user?.customer?.isProfileComplete ?? true;
  // Without an area there is no feeder, so the API has no schedule to give.
  const schedulesQuery = useResource(customerQueries.schedules, { enabled: isProfileComplete });
  const outagesQuery = useResource(customerQueries.recentOutages);
  const billsQuery = useResource(customerQueries.billHistory);

  const schedules = schedulesQuery.data?.data ?? [];
  const outages = outagesQuery.data?.data ?? [];
  const bills = billsQuery.data?.data ?? [];

  const upcoming = schedules.filter((schedule) => schedule.phase === "UPCOMING");
  const openReports = outages.filter((outage) =>
    (OPEN_OUTAGE_STATUSES as readonly string[]).includes(outage.status),
  );
  const unpaid = bills.filter((bill) => bill.status === "UNPAID");
  const overdueCount = unpaid.filter((bill) => bill.isOverdue).length;
  // Summed in paisa: floating-point taka would drift.
  const amountDue = unpaid.reduce((total, bill) => total + Math.round(Number(bill.totalAmount) * 100), 0) / 100;
  const latestBill = bills[0];
  const feeder = user?.customer?.area?.feeder;

  // Oldest month first, so the chart reads left to right.
  const consumption = [...bills].reverse().map((bill) => ({
    month: bill.billingMonth,
    units: bill.unitsConsumed,
  }));

  const isLoadingStats = billsQuery.isPending || outagesQuery.isPending;

  return (
    <>
      <PageHeader
        title={user ? `Hello, ${user.name.split(" ")[0]}` : "Your dashboard"}
        description="Your power, your reports and your bills, in one place."
        actions={
          <>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard/bills">
                <Receipt data-icon="inline-start" />
                Pay a bill
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/dashboard/outages?report=1">
                <Siren data-icon="inline-start" />
                Report an outage
              </Link>
            </Button>
          </>
        }
      />

      {!isProfileComplete ? (
        <Alert>
          <UserCog aria-hidden />
          <AlertTitle>Finish setting up your account</AlertTitle>
          <AlertDescription>
            Add your area and meter number to see your feeder&apos;s schedule and report outages.
          </AlertDescription>
          <AlertAction>
            <Button asChild size="sm">
              <Link href="/dashboard/profile">Complete profile</Link>
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      {schedulesQuery.isPending && isProfileComplete ? (
        <Skeleton className="h-36 rounded-3xl" />
      ) : (
        <PowerStatus schedules={schedules} outages={outages} />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoadingStats ? (
          Array.from({ length: 4 }, (_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <StatCard
              label="Next planned cut"
              icon={CalendarClock}
              tone="info"
              value={upcoming[0] ? formatShortDate(upcoming[0].startTime) : "None"}
              hint={
                upcoming[0]
                  ? formatTimeRange(upcoming[0].startTime, upcoming[0].endTime)
                  : "Nothing is scheduled for your feeder"
              }
            />
            <StatCard
              label="Open outage reports"
              icon={Siren}
              tone={openReports.length > 0 ? "warning" : "success"}
              value={openReports.length}
              hint={openReports.length > 0 ? "Being handled by the control room" : "All clear"}
            />
            <StatCard
              label="Amount due"
              icon={Wallet}
              tone={overdueCount > 0 ? "danger" : unpaid.length > 0 ? "warning" : "success"}
              value={formatMoney(amountDue)}
              hint={
                unpaid.length === 0
                  ? "Every bill is paid"
                  : `${unpaid.length} unpaid ${unpaid.length === 1 ? "bill" : "bills"}${overdueCount > 0 ? `, ${overdueCount} overdue` : ""}`
              }
            />
            <StatCard
              label="Last billed use"
              icon={Gauge}
              tone="brand"
              value={latestBill ? `${formatNumber(latestBill.unitsConsumed)} kWh` : "—"}
              hint={latestBill ? formatMonth(latestBill.billingMonth) : "No bill issued yet"}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section
          aria-labelledby="upcoming-heading"
          className="bg-card flex flex-col gap-4 rounded-2xl border p-5 xl:col-span-2"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="upcoming-heading" className="font-sans text-base font-semibold tracking-normal">
              Planned cuts on your feeder
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/schedules">
                View all
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          {schedulesQuery.isError && isProfileComplete ? (
            <QueryError error={schedulesQuery.error} onRetry={() => schedulesQuery.refetch()} />
          ) : schedules.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              title="Nothing planned"
              description="No load shedding or maintenance is scheduled for your feeder right now."
              className="py-8"
            />
          ) : (
            <ul className="divide-y">
              {schedules.slice(0, 4).map((schedule) => (
                <li
                  key={schedule.id}
                  className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="nums font-medium">
                      {formatShortDate(schedule.startTime)} ·{" "}
                      {formatTimeRange(schedule.startTime, schedule.endTime)}
                    </p>
                    <p className="text-muted-foreground truncate text-sm">
                      {schedule.reason ?? "No reason given"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <ScheduleTypeBadge type={schedule.type} />
                    <SchedulePhaseBadge phase={schedule.phase} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          aria-labelledby="feeder-heading"
          className="bg-card flex flex-col gap-4 rounded-2xl border p-5"
        >
          <h2 id="feeder-heading" className="font-sans text-base font-semibold tracking-normal">
            Your connection
          </h2>
          {!user ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-4 w-44" />
            </div>
          ) : feeder && user.customer?.area ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <p className="text-muted-foreground font-mono text-xs">{feeder.code}</p>
                  <p className="font-medium">{feeder.name}</p>
                </div>
                <FeederPriorityBadge priority={feeder.priority} />
              </div>
              <dl className="text-muted-foreground flex flex-col gap-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  <dt className="sr-only">Area</dt>
                  <dd>{user.customer.area.name}</dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <Building2 className="size-4 shrink-0" aria-hidden />
                  <dt className="sr-only">Substation and zone</dt>
                  <dd>
                    {feeder.substation.name} · {feeder.substation.zone.name}
                  </dd>
                </div>
                <div className="flex items-center gap-2.5">
                  <Zap className="size-4 shrink-0" aria-hidden />
                  <dt className="sr-only">Meter</dt>
                  <dd className="font-mono">{user.customer.meterNumber ?? "No meter number yet"}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              Your account is not linked to an area yet, so we cannot tell which feeder supplies you.
            </p>
          )}
          <Button asChild variant="outline" size="lg" className="mt-auto">
            <Link href="/dashboard/profile">
              <UserCog data-icon="inline-start" />
              Manage profile
            </Link>
          </Button>
        </section>
      </div>

      <ChartCard
        title="Electricity used per month"
        description="Units (kWh) on each of your bills"
        isEmpty={consumption.length === 0}
        emptyMessage="Your consumption will appear here once your first bill is issued."
        table={{
          columns: [{ header: "Month" }, { header: "Units (kWh)", align: "right" }],
          rows: consumption.map((row) => [formatMonth(row.month), formatNumber(row.units)]),
        }}
      >
        <SimpleBarChart
          data={consumption}
          categoryKey="month"
          series={[{ key: "units", label: "Units" }]}
          formatCategory={formatMonthShort}
          formatValue={(value) => `${formatNumber(value)} kWh`}
        />
      </ChartCard>
    </>
  );
}
