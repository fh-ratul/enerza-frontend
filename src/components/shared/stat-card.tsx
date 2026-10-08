import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tone } from "@/lib/status";
import { cn } from "@/lib/utils";

const ICON_TONE: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/12 text-warning",
  danger: "bg-destructive/10 text-destructive",
  brand: "bg-brand/10 text-brand",
  volt: "bg-primary/25 text-foreground dark:bg-primary/15 dark:text-primary",
};

type StatCardProps = {
  label: string;
  value: ReactNode;
  /** A short line under the value: what it is measured against, or what it means. */
  hint?: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  className?: string;
};

/**
 * One headline number. The value is plain text in the interface font with
 * proportional figures; colour is used only for the icon, never for the number.
 */
export function StatCard({ label, value, hint, icon: Icon, tone = "neutral", className }: StatCardProps) {
  return (
    <div className={cn("bg-card flex flex-col gap-3 rounded-2xl border p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{label}</p>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", ICON_TONE[tone])}>
          <Icon className="size-4.5" aria-hidden />
        </span>
      </div>
      <p className="text-3xl leading-none font-semibold tracking-tight">{value}</p>
      {hint ? <p className="text-muted-foreground text-sm leading-snug">{hint}</p> : null}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-2xl border p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-36" />
    </div>
  );
}
