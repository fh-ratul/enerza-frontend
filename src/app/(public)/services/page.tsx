import {
  BellRing,
  CalendarClock,
  ChartColumn,
  Check,
  CreditCard,
  FileClock,
  Gauge,
  type LucideIcon,
  Receipt,
  Scale,
  ShieldCheck,
  Siren,
  UserCog,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import { CtaBand } from "@/components/marketing/cta-band";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { images } from "@/lib/images";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Services" };

type ServiceGroup = {
  id: string;
  audience: string;
  title: string;
  lead: string;
  image: { src: StaticImageData; alt: string };
  services: { icon: LucideIcon; title: string; body: string }[];
};

const groups: ServiceGroup[] = [
  {
    id: "customers",
    audience: "For customers",
    title: "Know before it happens, and act when it does",
    lead: "Your account is tied to your meter and your area, so everything you see is about the feeder that actually supplies you.",
    image: images.dhakaNightRoad,
    services: [
      {
        icon: CalendarClock,
        title: "Your feeder's schedule",
        body: "Upcoming and ongoing load-shedding and maintenance windows, with the reason for each, in Dhaka time.",
      },
      {
        icon: Siren,
        title: "Outage reporting",
        body: "Report a power cut with a description and a photo. Planned shedding is explained on the spot; a real fault opens a repair job.",
      },
      {
        icon: Receipt,
        title: "Itemised bills",
        body: "Meter readings, units, energy charge slab by slab, demand charge and VAT: the whole calculation, not just a total.",
      },
      {
        icon: CreditCard,
        title: "Online payment",
        body: "Pay with bKash, or with cards and mobile banking through SSLCommerz. The bill is settled only when the gateway confirms it.",
      },
    ],
  },
  {
    id: "technicians",
    audience: "For technicians",
    title: "The next job, and everything needed to close it",
    lead: "Crews work one zone. Jobs reach the technician who is on duty, nearest in workload, and has waited longest for one.",
    image: images.electricianPanel,
    services: [
      {
        icon: Wrench,
        title: "Assigned jobs",
        body: "Each outage shows the feeder, its priority, how many customers reported it and what they wrote.",
      },
      {
        icon: Gauge,
        title: "Status in two taps",
        body: "Start work when you arrive; resolve with a note when supply is back. Customers see both as they happen.",
      },
      {
        icon: UserCog,
        title: "Duty switch",
        body: "Go off duty and no new job is assigned to you. Your open jobs stay yours until they are resolved or reassigned.",
      },
      {
        icon: ChartColumn,
        title: "Your own numbers",
        body: "Jobs resolved, average time to restore and current workload, drawn from your real job history.",
      },
    ],
  },
  {
    id: "control-room",
    audience: "For the control room",
    title: "Plan supply fairly and account for every decision",
    lead: "Administrators manage the grid model, publish schedules, dispatch crews and issue bills, with an audit entry for each action.",
    image: images.substationDusk,
    services: [
      {
        icon: Scale,
        title: "Fair-rotation generator",
        body: "Enter the shortfall in megawatts for a zone and a time window. Preview the rotation, see what cannot be covered, then save it as drafts.",
      },
      {
        icon: ShieldCheck,
        title: "Conflict-safe scheduling",
        body: "Overlapping schedules on a feeder are rejected, even when two administrators submit at the same moment.",
      },
      {
        icon: BellRing,
        title: "Dispatch",
        body: "Assign an outage to a named technician or let the system pick. Capacity is claimed atomically, so nobody is over-assigned.",
      },
      {
        icon: FileClock,
        title: "Analytics and audit",
        body: "MTTR, SAIFI and SAIDI by zone, revenue and unpaid totals, and a searchable log of who did what and when.",
      },
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything between the substation and your switchboard"
        description="Enerza is one system with three kinds of users. Here is what each of them can do with it."
        image={images.breakerPanel}
        imageClassName="object-[50%_40%]"
      >
        <nav aria-label="On this page" className="mt-2 flex flex-wrap gap-2">
          {groups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/15"
            >
              {group.audience}
            </a>
          ))}
        </nav>
      </PageHero>

      {groups.map((group, index) => (
        <Section
          key={group.id}
          id={group.id}
          className={cn("scroll-mt-16", index % 2 === 1 && "bg-muted/40 border-y")}
        >
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className={cn("flex flex-col gap-10", index % 2 === 1 && "lg:order-2")}>
              <SectionHeading
                eyebrow={group.audience}
                title={group.title}
                description={group.lead}
              />
              <ul className="grid gap-6 sm:grid-cols-2">
                {group.services.map((service) => (
                  <li key={service.title} className="flex flex-col gap-2.5">
                    <span className="bg-primary/20 dark:bg-primary/15 dark:text-primary grid size-10 place-items-center rounded-xl">
                      <service.icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="font-semibold">{service.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{service.body}</p>
                  </li>
                ))}
              </ul>
            </div>

            <Reveal>
              <div className="relative aspect-4/3 overflow-hidden rounded-[2rem] border lg:aspect-5/6">
                <Image
                  src={group.image.src}
                  alt={group.image.alt}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </Section>
      ))}

      <Section>
        <SectionHeading
          align="center"
          eyebrow="Built in"
          title="The guarantees that hold for everyone"
        />
        <ul className="mx-auto mt-12 grid max-w-4xl gap-x-10 gap-y-4 sm:grid-cols-2">
          {[
            "Critical feeders are never load-shed",
            "No feeder is shed more than four hours a day",
            "One open outage per feeder, however many reports",
            "A bill is marked paid only after the gateway confirms the amount",
            "Every schedule, assignment and payment is written to the audit log",
            "Each role sees only what its job needs",
          ].map((guarantee) => (
            <li key={guarantee} className="flex gap-3 border-b pb-4">
              <Check className="text-success mt-0.5 size-5 shrink-0" aria-hidden />
              <span>{guarantee}</span>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand />
    </>
  );
}
