import type { ComponentProps } from "react";
import type { Tone } from "@/lib/status";
import { cn } from "@/lib/utils";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-info/10 text-info border-info/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/12 text-warning border-warning/25",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  brand: "bg-brand/10 text-brand border-brand/20",
  // Amber is a fill, never text: the label keeps the dark primary foreground.
  volt: "bg-primary/25 text-foreground border-primary/50 dark:bg-primary/15 dark:text-primary dark:border-primary/30",
};

const DOT_CLASS: Record<Tone, string> = {
  neutral: "bg-muted-foreground/60",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  brand: "bg-brand",
  volt: "bg-primary",
};

type StatusBadgeProps = ComponentProps<"span"> & {
  tone?: Tone;
  /** A coloured dot before the label; `pulse` animates it for live states. */
  dot?: boolean;
  pulse?: boolean;
};

/** The one badge used for every status, priority and role across the app. */
export function StatusBadge({
  tone = "neutral",
  dot = false,
  pulse = false,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASS[tone],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span aria-hidden className="relative flex size-1.5">
          {pulse ? (
            <span
              className={cn(
                "animate-pulse-ring absolute inline-flex size-full rounded-full",
                DOT_CLASS[tone],
              )}
            />
          ) : null}
          <span className={cn("relative inline-flex size-1.5 rounded-full", DOT_CLASS[tone])} />
        </span>
      ) : null}
      {children}
    </span>
  );
}
