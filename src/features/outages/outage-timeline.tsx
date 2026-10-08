import { formatDateTime } from "@/lib/format";
import { OUTAGE_STATUS, ROLE } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { OutageTimelineEntry } from "@/types/api";

const DOT_CLASS = {
  neutral: "bg-muted-foreground/50",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  brand: "bg-brand",
  volt: "bg-primary",
} as const;

/** Every status change of an outage, oldest first, as the API recorded it. */
export function OutageTimeline({ entries }: { entries: OutageTimelineEntry[] }) {
  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => {
        const { label, tone } = OUTAGE_STATUS[entry.toStatus];
        const isLast = index === entries.length - 1;

        return (
          <li key={entry.id} className="relative flex gap-3.5 pb-5 last:pb-0">
            {!isLast ? (
              <span aria-hidden className="bg-border absolute top-4 bottom-0 left-[5px] w-px" />
            ) : null}
            <span
              aria-hidden
              className={cn(
                "ring-card relative mt-1.5 size-[11px] shrink-0 rounded-full ring-4",
                DOT_CLASS[tone],
              )}
            />
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-sm font-medium">
                {label}
                {entry.changedBy ? (
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    by {entry.changedBy.name} ({ROLE[entry.changedBy.role].label.toLowerCase()})
                  </span>
                ) : null}
              </p>
              <time dateTime={entry.createdAt} className="text-muted-foreground nums text-xs">
                {formatDateTime(entry.createdAt)}
              </time>
              {entry.note ? (
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{entry.note}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
