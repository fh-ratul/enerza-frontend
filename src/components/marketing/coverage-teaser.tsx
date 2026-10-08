import { ArrowRight, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import type { GridSnapshot } from "@/features/grid/public-data";
import { formatMW } from "@/lib/format";
import { images } from "@/lib/images";
import { Section, SectionHeading } from "./section";

const MAX_AREA_CHIPS = 6;

export function CoverageTeaser({ grid }: { grid: GridSnapshot | null }) {
  return (
    <Section className="bg-muted/40 border-y">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Coverage"
            title="Is your area on the Enerza grid?"
            description="Every area belongs to a feeder, every feeder to a substation, every substation to a zone. Find yours and you know exactly which schedule applies to you."
          />

          {grid ? (
            <ul className="flex flex-col gap-3">
              {grid.zones.map((zone) => (
                <li key={zone.id} className="bg-card rounded-2xl border p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">{zone.name}</h3>
                    <span className="text-muted-foreground nums text-sm">
                      {zone.feederCount} feeders · {formatMW(zone.loadMW)}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1.5 flex items-center gap-2 text-sm">
                    <Building2 className="size-4 shrink-0" aria-hidden />
                    {zone.substations.map((substation) => substation.name).join(", ")}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {zone.areaNames.slice(0, MAX_AREA_CHIPS).map((area) => (
                      <li key={area} className="bg-muted rounded-full px-2.5 py-1 text-xs font-medium">
                        {area}
                      </li>
                    ))}
                    {zone.areaNames.length > MAX_AREA_CHIPS ? (
                      <li className="text-muted-foreground px-1 py-1 text-xs">
                        +{zone.areaNames.length - MAX_AREA_CHIPS} more
                      </li>
                    ) : null}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="bg-card text-muted-foreground rounded-2xl border p-5 text-sm">
              The coverage list could not be loaded just now. Open the coverage page to try again.
            </p>
          )}

          <Button asChild size="xl" variant="outline" className="self-start">
            <Link href="/coverage">
              Browse all feeders and areas
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        <Reveal className="relative">
          <div className="relative aspect-4/5 overflow-hidden rounded-[2rem] border sm:aspect-5/4 lg:aspect-4/5">
            <Image
              src={images.dhanmondiLakeNight.src}
              alt={images.dhanmondiLakeNight.alt}
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="from-ink/85 absolute inset-0 bg-linear-to-t via-transparent to-transparent"
            />
            <p className="absolute inset-x-6 bottom-6 max-w-sm text-sm leading-relaxed text-white/85">
              Dhanmondi after dark. When a feeder here is due for shedding, the people living around
              the lake know the hour before it happens.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
