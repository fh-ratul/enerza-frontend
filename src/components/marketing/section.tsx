import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

export function Section({ className, children, ...props }: ComponentProps<"section">) {
  return (
    <section className={cn("py-16 sm:py-20 lg:py-24", className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p
      className={cn(
        "text-brand inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[0.18em] uppercase",
        className,
      )}
    >
      <span aria-hidden className="bg-primary size-1.5 rounded-full" />
      {children}
    </p>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  /** The page's main heading uses h1; section headings default to h2. */
  as?: "h1" | "h2";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  as: Heading = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading className="text-3xl leading-[1.1] font-semibold sm:text-4xl lg:text-[2.75rem]">
        {title}
      </Heading>
      {description ? (
        <p className="text-muted-foreground text-base leading-relaxed text-pretty sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
