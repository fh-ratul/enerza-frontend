import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONE = {
  success: "bg-success/12 text-success ring-success/20",
  warning: "bg-warning/15 text-warning ring-warning/25",
  danger: "bg-destructive/10 text-destructive ring-destructive/20",
  neutral: "bg-muted text-muted-foreground ring-border",
} as const;

export type PaymentDetail = { label: string; value: ReactNode; mono?: boolean };

type PaymentResultCardProps = {
  tone: keyof typeof TONE;
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  /** The headline figure, e.g. the amount paid. */
  amount?: string;
  details?: PaymentDetail[];
  notice?: ReactNode;
  actions: ReactNode;
};

/** The one card both payment result pages are made of. */
export function PaymentResultCard({
  tone,
  icon: Icon,
  title,
  description,
  amount,
  details = [],
  notice,
  actions,
}: PaymentResultCardProps) {
  return (
    <article className="bg-card flex w-full max-w-lg flex-col gap-7 rounded-3xl border p-6 shadow-sm sm:p-9">
      <header className="flex flex-col items-center gap-4 text-center">
        <span className={cn("grid size-16 place-items-center rounded-full ring-8", TONE[tone])}>
          <Icon className="size-8" aria-hidden />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
          <p className="text-muted-foreground text-pretty">{description}</p>
        </div>
        {amount ? <p className="text-4xl font-semibold tracking-tight">{amount}</p> : null}
      </header>

      {details.length > 0 ? (
        <dl className="bg-muted/40 flex flex-col gap-3 rounded-2xl border p-5 text-sm">
          {details.map((detail) => (
            <div key={detail.label} className="flex items-baseline justify-between gap-6">
              <dt className="text-muted-foreground shrink-0">{detail.label}</dt>
              <dd
                className={cn(
                  "min-w-0 text-right font-medium break-all",
                  detail.mono ? "font-mono text-xs" : "nums",
                )}
              >
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {notice ? (
        <p className="bg-warning/10 border-warning/25 rounded-xl border p-4 text-sm text-pretty">
          {notice}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">{actions}</div>
    </article>
  );
}
