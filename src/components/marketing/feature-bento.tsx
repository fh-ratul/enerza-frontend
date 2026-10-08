import {
  BellRing,
  FileClock,
  type LucideIcon,
  Receipt,
  Scale,
  Siren,
  Wrench,
} from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import { Reveal } from "@/components/shared/reveal";
import { images } from "@/lib/images";
import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "./section";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
  className: string;
  image?: { src: StaticImageData; alt: string };
};

const features: Feature[] = [
  {
    icon: Scale,
    title: "A schedule that shares the load",
    body: "When supply falls short, the scheduler picks the feeders that were shed least over the past week. No area is cut twice in a row, none for more than four hours a day, and hospital feeders are never touched.",
    className: "lg:col-span-4",
    image: images.engineerPlans,
  },
  {
    icon: BellRing,
    title: "Told before the lights go out",
    body: "The moment a schedule is published, every customer on that feeder gets the date, the window and the reason by email, and sees it on their dashboard.",
    className: "lg:col-span-2",
  },
  {
    icon: Siren,
    title: "One outage, however many reports",
    body: "Reports from the same feeder join a single outage instead of piling up. Ten reports raise its priority; a report during planned shedding is answered on the spot.",
    className: "lg:col-span-2",
  },
  {
    icon: Wrench,
    title: "From report to repair, in the open",
    body: "The nearest available technician is assigned automatically. You see every step: reported, assigned, work started, resolved, with the note the technician left.",
    className: "lg:col-span-4",
    image: images.linemenPole,
  },
  {
    icon: Receipt,
    title: "Bills you can check",
    body: "Each bill shows the meter readings and the slab-by-slab arithmetic behind the total. Pay it with bKash, a card or mobile banking, and get a receipt by email.",
    className: "lg:col-span-3",
  },
  {
    icon: FileClock,
    title: "Every decision on record",
    body: "Who published a schedule, who reassigned a job, which payment settled a bill: each action is written to an audit log the moment it happens.",
    className: "lg:col-span-3",
  },
];

export function FeatureBento() {
  return (
    <Section id="features">
      <SectionHeading
        eyebrow="What it does"
        title="Built around the three questions every customer asks"
        description="When will the power go? Why is it out? When is it back? Enerza answers them for customers, and gives the people running the grid the tools to keep those answers true."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-6">
        {features.map((feature, index) => (
          <Reveal key={feature.title} delay={(index % 2) * 0.08} className={feature.className}>
            <article
              className={cn(
                "group bg-card relative flex h-full flex-col overflow-hidden rounded-3xl border",
                feature.image && "md:flex-row",
              )}
            >
              <div className="flex flex-1 flex-col gap-4 p-6 sm:p-8">
                <span className="bg-primary/20 text-foreground dark:bg-primary/15 dark:text-primary grid size-11 place-items-center rounded-2xl">
                  <feature.icon className="size-5" aria-hidden />
                </span>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.body}</p>
              </div>

              {feature.image ? (
                <div className="relative min-h-56 md:w-[44%]">
                  <Image
                    src={feature.image.src}
                    alt={feature.image.alt}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 44vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              ) : null}
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
