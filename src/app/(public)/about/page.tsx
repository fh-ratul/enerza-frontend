import { Eye, Factory, FileCheck2, Home, type LucideIcon, MapPinned, Scale, Zap } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { CtaBand } from "@/components/marketing/cta-band";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Reveal } from "@/components/shared/reveal";
import { getGridSnapshot } from "@/features/grid/public-data";
import { formatMW } from "@/lib/format";
import { images } from "@/lib/images";

export const metadata: Metadata = { title: "About" };

const principles: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Scale,
    title: "Fairness is computed, not promised",
    body: "The rotation is produced by an algorithm that weighs the past week of shedding for every feeder. The same input always gives the same plan.",
  },
  {
    icon: Eye,
    title: "Customers see what the control room sees",
    body: "A published schedule, an outage's status and a bill's arithmetic are shown to customers exactly as they are stored.",
  },
  {
    icon: FileCheck2,
    title: "Nothing changes without a record",
    body: "Publishing a schedule, reassigning a job, blocking an account, settling a payment: each writes an audit entry in the same transaction as the change.",
  },
];

const hierarchy: { icon: LucideIcon; level: string; body: string }[] = [
  { icon: MapPinned, level: "Zone", body: "A part of the city with its own field crews." },
  { icon: Factory, level: "Substation", body: "Steps power down and feeds several feeders." },
  { icon: Zap, level: "Feeder", body: "One line out of a substation. Schedules and outages are per feeder." },
  { icon: Home, level: "Area", body: "The neighbourhoods a feeder supplies. Customers register in an area." },
];

export default async function AboutPage() {
  const grid = await getGridSnapshot();

  const figures = grid
    ? [
        { label: "Zones", value: grid.totals.zones },
        { label: "Substations", value: grid.totals.substations },
        { label: "Feeders", value: grid.totals.feeders },
        { label: "Areas served", value: grid.totals.areas },
        { label: "Connected load", value: formatMW(grid.totals.loadMW) },
      ]
    : [];

  return (
    <>
      <PageHero
        eyebrow="About Enerza"
        title="Load shedding is sometimes unavoidable. Not knowing when is not."
        description="Enerza was built on one observation: people cope with a power cut far better when they know it is coming, why, and when it will end."
        image={images.earthNightLights}
      />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SectionHeading
              eyebrow="The problem"
              title="A cut without warning costs more than the electricity"
            />
            <div className="text-muted-foreground flex flex-col gap-4 leading-relaxed">
              <p>
                When supply falls short of demand, a distribution company has to switch some feeders
                off. That part is physics. What usually goes wrong is everything around it: the same
                neighbourhoods are cut again and again, nobody is told beforehand, and a customer
                who calls to report a fault cannot tell whether it is a fault at all.
              </p>
              <p>
                Enerza treats those as software problems. It plans the rotation so the burden is
                shared, publishes it to the customers it affects, tells planned shedding apart from
                real faults at the moment a customer reports one, and follows each fault until a
                technician closes it.
              </p>
              <p>
                The same account then handles the monthly bill, because the person waiting for the
                lights to come back is the person paying for the electricity.
              </p>
            </div>
          </div>
          <Reveal>
            <div className="relative aspect-4/3 overflow-hidden rounded-[2rem] border">
              <Image
                src={images.towersGreen.src}
                alt={images.towersGreen.alt}
                fill
                placeholder="blur"
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-muted/40 border-y">
        <SectionHeading
          eyebrow="Principles"
          title="Three rules the system is built on"
          align="center"
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {principles.map((principle, index) => (
            <Reveal key={principle.title} delay={index * 0.08}>
              <article className="bg-card flex h-full flex-col gap-4 rounded-3xl border p-6 sm:p-8">
                <span className="bg-ink text-primary grid size-12 place-items-center rounded-2xl">
                  <principle.icon className="size-5" aria-hidden />
                </span>
                <h3 className="text-xl font-semibold">{principle.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{principle.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="How the grid is modelled"
            title="Four levels, from the city down to your street"
            description="Schedules and outages belong to feeders, because a feeder is what is actually switched off. Your area tells the system which feeder is yours."
          />
          <ol className="flex flex-col">
            {hierarchy.map((item, index) => (
              <li key={item.level} className="relative flex gap-5 pb-8 last:pb-0">
                {/* The line that connects one level to the next. */}
                {index < hierarchy.length - 1 ? (
                  <span aria-hidden className="bg-border absolute top-12 bottom-0 left-6 w-px" />
                ) : null}
                <span className="bg-card relative grid size-12 shrink-0 place-items-center rounded-2xl border shadow-xs">
                  <item.icon className="text-brand size-5" aria-hidden />
                </span>
                <div className="flex flex-col gap-1 pt-1">
                  <h3 className="text-lg font-semibold">{item.level}</h3>
                  <p className="text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {figures.length > 0 ? (
          <dl className="bg-card mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border sm:grid-cols-3 lg:grid-cols-5">
            {figures.map((figure) => (
              <div key={figure.label} className="bg-card flex flex-col gap-1 p-6 outline outline-border">
                <dt className="text-muted-foreground text-sm">{figure.label}</dt>
                <dd className="font-heading text-3xl font-semibold">{figure.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Section>

      <CtaBand
        title="See the system from the inside."
        description="Demo accounts for a customer, a technician and an administrator are one click away on the login page."
      />
    </>
  );
}
