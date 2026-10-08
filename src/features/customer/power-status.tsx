"use client";

import { ArrowRight, CircleCheck, type LucideIcon, LightbulbOff, Wrench } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { formatDuration, formatShortDate, formatTime, formatTimeRange } from "@/lib/format";
import { OUTAGE_STATUS, SCHEDULE_TYPE } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { CustomerSchedule, Outage } from "@/types/api";
import { OPEN_OUTAGE_STATUSES } from "./queries";

type PowerStatusProps = {
  schedules: CustomerSchedule[];
  outages: Outage[];
};

type Status = {
  tone: "ok" | "planned" | "fault";
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  detail: string;
  action?: { href: string; label: string };
};

const TONE_CLASS: Record<Status["tone"], string> = {
  ok: "from-success/15 border-success/25",
  planned: "from-warning/20 border-warning/30",
  fault: "from-destructive/15 border-destructive/25",
};

const ICON_CLASS: Record<Status["tone"], string> = {
  ok: "bg-success/15 text-success",
  planned: "bg-warning/20 text-warning",
  fault: "bg-destructive/15 text-destructive",
};

/**
 * The first thing a customer wants to know: is my power on, and if not, why
 * and until when. Worked out from the feeder's published schedule and the
 * customer's own open reports.
 */
export function PowerStatus({ schedules, outages }: PowerStatusProps) {
  const now = useNow();
  const ongoing = schedules.find((schedule) => schedule.phase === "ONGOING");
  const upcoming = schedules.find((schedule) => schedule.phase === "UPCOMING");
  const openOutage = outages.find((outage) =>
    (OPEN_OUTAGE_STATUSES as readonly string[]).includes(outage.status),
  );

  let status: Status;

  if (ongoing) {
    const minutesLeft = now
      ? Math.max(0, Math.round((new Date(ongoing.endTime).getTime() - now.getTime()) / 60_000))
      : null;

    status = {
      tone: "planned",
      icon: LightbulbOff,
      eyebrow: `${SCHEDULE_TYPE[ongoing.type].label} in progress`,
      title: `Power is planned to return at ${formatTime(ongoing.endTime)}`,
      detail: [
        minutesLeft !== null ? `About ${formatDuration(minutesLeft)} to go.` : null,
        ongoing.reason,
      ]
        .filter(Boolean)
        .join(" "),
      action: { href: "/dashboard/schedules", label: "See the schedule" },
    };
  } else if (openOutage) {
    status = {
      tone: "fault",
      icon: Wrench,
      eyebrow: `Outage on ${openOutage.feeder.name}`,
      title:
        openOutage.status === "REPORTED"
          ? "Your report is with the control room"
          : openOutage.status === "ASSIGNED"
            ? `${openOutage.technician?.user.name ?? "A technician"} has been assigned`
            : `${openOutage.technician?.user.name ?? "A technician"} is working on it`,
      detail: `Status: ${OUTAGE_STATUS[openOutage.status].label.toLowerCase()}. ${openOutage.reportCount} ${openOutage.reportCount === 1 ? "customer has" : "customers have"} reported this outage.`,
      action: { href: "/dashboard/outages", label: "Follow the repair" },
    };
  } else {
    status = {
      tone: "ok",
      icon: CircleCheck,
      eyebrow: "No cut in progress",
      title: upcoming
        ? `Next planned cut: ${formatShortDate(upcoming.startTime)}, ${formatTimeRange(upcoming.startTime, upcoming.endTime)}`
        : "No cuts are planned for your feeder",
      detail: upcoming
        ? (upcoming.reason ?? SCHEDULE_TYPE[upcoming.type].label)
        : "If your power is out anyway, report it and we will look into it.",
      action: upcoming
        ? { href: "/dashboard/schedules", label: "See the schedule" }
        : { href: "/dashboard/outages", label: "Report an outage" },
    };
  }

  return (
    <section
      aria-label="Power status"
      className={cn(
        "bg-card flex flex-col gap-5 rounded-3xl border bg-linear-to-br to-transparent to-60% p-6 sm:flex-row sm:items-center sm:p-7",
        TONE_CLASS[status.tone],
      )}
    >
      <span
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-2xl",
          ICON_CLASS[status.tone],
        )}
      >
        <status.icon className="size-7" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-muted-foreground text-sm font-medium">{status.eyebrow}</p>
        <h2 className="text-xl font-semibold sm:text-2xl">{status.title}</h2>
        <p className="text-muted-foreground text-pretty">{status.detail}</p>
      </div>
      {status.action ? (
        <Button asChild variant="outline" size="xl" className="shrink-0 self-start sm:self-center">
          <Link href={status.action.href}>
            {status.action.label}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      ) : null}
    </section>
  );
}
