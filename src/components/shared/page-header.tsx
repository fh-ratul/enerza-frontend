import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  /** Buttons that act on the page as a whole. */
  actions?: ReactNode;
  className?: string;
};

/** The title block at the top of every dashboard page. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description ? (
          <p className="text-muted-foreground max-w-2xl text-pretty">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
