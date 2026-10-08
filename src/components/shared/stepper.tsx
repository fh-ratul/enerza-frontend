import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StepperProps = {
  steps: { title: string; description?: string }[];
  /** Index of the step being worked on. */
  current: number;
  className?: string;
};

/** Progress through a multi-step form: done, current and upcoming steps. */
export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cn("flex items-start", className)}>
      {steps.map((step, index) => {
        const isDone = index < current;
        const isCurrent = index === current;

        return (
          <li
            key={step.title}
            aria-current={isCurrent ? "step" : undefined}
            className="flex flex-1 flex-col gap-2 last:flex-none"
          >
            <div className="flex items-center">
              <span
                className={cn(
                  "nums grid size-8 shrink-0 place-items-center rounded-full border text-sm font-medium transition-colors",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-foreground bg-foreground text-background",
                  !isDone && !isCurrent && "text-muted-foreground",
                )}
              >
                {isDone ? <Check className="size-4" aria-hidden /> : index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "mx-2 h-px flex-1 transition-colors",
                    isDone ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
            </div>
            <div className="flex flex-col pr-2">
              <span
                className={cn(
                  "text-sm font-medium",
                  !isDone && !isCurrent && "text-muted-foreground",
                )}
              >
                <span className="sr-only">
                  {isDone ? "Completed: " : isCurrent ? "Current step: " : "Upcoming: "}
                </span>
                {step.title}
              </span>
              {step.description ? (
                <span className="text-muted-foreground hidden text-xs sm:block">
                  {step.description}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
