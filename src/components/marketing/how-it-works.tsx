import { CalendarClock, CreditCard, type LucideIcon, TriangleAlert, UserPlus } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { Section, SectionHeading } from "./section";

const steps: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: UserPlus,
    title: "Register with your meter",
    body: "Pick your area and enter your meter number. That links your account to the feeder that supplies your home or shop.",
  },
  {
    icon: CalendarClock,
    title: "See your schedule",
    body: "Your dashboard shows every published load-shedding and maintenance window for your feeder, with times in Dhaka time.",
  },
  {
    icon: TriangleAlert,
    title: "Report an outage",
    body: "Describe what happened and attach a photo if it helps. If it is planned shedding, you are told when it ends. If not, a technician is on the way.",
  },
  {
    icon: CreditCard,
    title: "Pay your bill",
    body: "Open the month's bill, check the readings and the charges, and pay with bKash or SSLCommerz. The bill is marked paid as soon as the gateway confirms.",
  },
];

export function HowItWorks() {
  return (
    <Section className="bg-muted/40 border-y">
      <SectionHeading
        align="center"
        eyebrow="How it works"
        title="Four steps, about two minutes"
        description="No app to install and nothing to configure. If you have an electricity meter in our service area, you can start now."
      />

      <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Reveal key={step.title} delay={index * 0.08}>
            <li className="relative flex h-full flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="bg-background grid size-12 shrink-0 place-items-center rounded-2xl border shadow-xs">
                  <step.icon className="text-brand size-5" aria-hidden />
                </span>
                {/* The rule that joins one step to the next on wide screens. */}
                <span aria-hidden className="bg-border hidden h-px flex-1 lg:block" />
                <span className="text-muted-foreground font-mono text-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
