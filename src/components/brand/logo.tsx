import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoMarkProps = { className?: string };

/** The bolt mark on its own. */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-primary text-primary-foreground grid size-8 shrink-0 place-items-center rounded-[10px] shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[58%]" fill="currentColor">
        <path d="M13.6 1.6 4.4 13.2c-.4.5 0 1.3.7 1.3h5.2l-1.4 7.2c-.2.9 1 1.4 1.5.7l9.2-11.6c.4-.5 0-1.3-.7-1.3h-5.2l1.4-7.2c.2-.9-1-1.4-1.5-.7Z" />
      </svg>
    </span>
  );
}

type LogoProps = {
  href?: string;
  className?: string;
  /** Hide the wordmark and keep it for screen readers only. */
  compact?: boolean;
};

export function Logo({ href = "/", className, compact = false }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Enerza home"
      className={cn(
        "focus-visible:ring-ring/60 inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3",
        className,
      )}
    >
      <LogoMark />
      <span
        className={cn("font-heading text-[1.15rem] font-bold tracking-tight", compact && "sr-only")}
      >
        Enerza
      </span>
    </Link>
  );
}
