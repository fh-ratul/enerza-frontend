"use client";

import { CalendarX, Clock, UserCog } from "lucide-react";
import Link from "next/link";
import { SchedulePhaseBadge, ScheduleTypeBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { QueryError } from "@/components/shared/query-error";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useNow } from "@/hooks/use-now";
import { useResource } from "@/hooks/use-resource";
import { formatDuration, formatRelative, formatShortDate, formatTimeRange, toDhakaDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CustomerSchedule } from "@/types/api";
import { customerQueries } from "./queries";

const minutesBetween = (start: string, end: string) =>
  (new Date(end).getTime() - new Date(start).getTime()) / 60_000;

/** Schedules bucketed by the Dhaka calendar day they start on. */
const groupByDay = (schedules: CustomerSchedule[]) => {
  const days = new Map<string, CustomerSchedule[]>();

  for (const schedule of schedules) {
    const day = toDhakaDay(schedule.startTime);

    days.set(day, [...(days.get(day) ?? []), schedule]);
  }

  return [...days.entries()];
};

export function ScheduleList() {
  const { user } = useAuth();
  const now = useNow();
  const isProfileComplete = user?.customer?.isProfileComplete ?? true;
  const query = useResource(customerQueries.schedules, {
    enabled: isProfileComplete,
    // A schedule changes phase with the clock, so keep this view current.
    refetchInterval: 60_000,
  });
  const schedules = query.data?.data ?? [];
  const feeder = user?.customer?.area?.feeder;

  return (
    <>
      <PageHeader
        title="Schedule"
        description={
          feeder
            ? `Published load shedding and maintenance for ${feeder.name} (${feeder.code}). All times are Dhaka time.`
            : "Published load shedding and maintenance for your feeder. All times are Dhaka time."
        }
      />

      {!isProfileComplete ? (
        <EmptyState
          icon={UserCog}
          title="Tell us where you live first"
          description="Your schedule depends on your area. Add it to your profile and your feeder's schedule appears here."
          action={
            <Button asChild size="lg">
              <Link href="/dashboard/profile">Complete profile</Link>
            </Button>
          }
        />
      ) : query.isPending ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <QueryError error={query.error} onRetry={() => query.refetch()} />
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No cuts are planned"
          description="Nothing is scheduled for your feeder at the moment. When the control room publishes a schedule, you will see it here and get an email."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {groupByDay(schedules).map(([day, items]) => (
            <section key={day} aria-labelledby={`day-${day}`} className="flex flex-col gap-3">
              <h2
                id={`day-${day}`}
                className="text-muted-foreground font-mono text-xs font-medium tracking-[0.14em] uppercase"
              >
                {formatShortDate(items[0].startTime)}
              </h2>
              <ul className="flex flex-col gap-3">
                {items.map((schedule) => {
                  const isOngoing = schedule.phase === "ONGOING";

                  return (
                    <li
                      key={schedule.id}
                      className={cn(
                        "bg-card flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center",
                        isOngoing && "border-warning/40 bg-warning/5",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="nums text-xl font-semibold">
                          {formatTimeRange(schedule.startTime, schedule.endTime)}
                        </p>
                        <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-sm">
                          <Clock className="size-3.5" aria-hidden />
                          {formatDuration(minutesBetween(schedule.startTime, schedule.endTime))}
                          {now ? (
                            <span>
                              ·{" "}
                              {isOngoing
                                ? `ends ${formatRelative(schedule.endTime, now)}`
                                : `starts ${formatRelative(schedule.startTime, now)}`}
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-1 text-sm">{schedule.reason ?? "No reason was given."}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <ScheduleTypeBadge type={schedule.type} />
                        <SchedulePhaseBadge phase={schedule.phase} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
