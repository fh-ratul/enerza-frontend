import { ArrowUpRight, Check, HardHat, Home, type LucideIcon, TowerControl } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { Section, SectionHeading } from "./section";

const roles: { icon: LucideIcon; name: string; summary: string; points: string[] }[] = [
  {
    icon: Home,
    name: "Customers",
    summary: "Households and businesses with a meter in our service area.",
    points: [
      "The load-shedding schedule for your own feeder",
      "Outage reports with photos, and a live repair timeline",
      "Monthly bills with the full calculation",
      "Online payment and a receipt by email",
    ],
  },
  {
    icon: HardHat,
    name: "Technicians",
    summary: "Field crews who restore supply, zone by zone.",
    points: [
      "A job list of the outages assigned to you",
      "Start and resolve work from your phone",
      "Go on or off duty with one switch",
      "Your own resolution times and workload",
    ],
  },
  {
    icon: TowerControl,
    name: "Control room",
    summary: "Administrators who plan supply and dispatch crews.",
    points: [
      "Feeders, areas and the fair-rotation generator",
      "Outage dispatch with automatic assignment",
      "Billing, users and a complete audit trail",
      "Reliability analytics: MTTR, SAIFI and SAIDI",
    ],
  },
];

export function RoleCards() {
  return (
    <Section>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Who it is for"
          title="One system, three ways in"
          description="Everyone sees the same grid, with the tools their job needs and nothing they should not touch."
        />
        <Link
          href="/login"
          className="text-brand group inline-flex items-center gap-1.5 self-start font-medium lg:self-end"
        >
          Log in to your account
          <ArrowUpRight
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </Link>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {roles.map((role, index) => (
          <Reveal key={role.name} delay={index * 0.08}>
            <article className="bg-card hover:border-foreground/20 flex h-full flex-col gap-5 rounded-3xl border p-6 transition-colors sm:p-8">
              <span className="bg-ink text-primary grid size-12 place-items-center rounded-2xl">
                <role.icon className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="text-xl font-semibold">{role.name}</h3>
                <p className="text-muted-foreground text-sm">{role.summary}</p>
              </div>
              <ul className="mt-auto flex flex-col gap-3 border-t pt-5 text-sm">
                {role.points.map((point) => (
                  <li key={point} className="flex gap-2.5">
                    <Check className="text-success mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
