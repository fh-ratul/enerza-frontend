import { ArrowRight, Check, MapPin, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { GridSnapshot } from "@/features/grid/public-data";
import { formatMW } from "@/lib/format";
import { images } from "@/lib/images";
import { Container } from "./section";

const promises = ["Fair, published schedules", "Live outage tracking", "bKash and card payments"];

function GridGlance({ grid }: { grid: GridSnapshot | null }) {
  if (!grid) {
    return (
      <div className="rounded-3xl border border-white/12 bg-white/6 p-6 text-sm text-white/70 backdrop-blur-xl">
        Live grid figures are unavailable right now. Everything else on this page still applies.
      </div>
    );
  }

  const stats = [
    { label: "Feeders managed", value: grid.totals.feeders },
    { label: "Areas served", value: grid.totals.areas },
    { label: "Substations", value: grid.totals.substations },
    { label: "Connected load", value: formatMW(grid.totals.loadMW) },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 relative duration-700">
      <div className="bg-ink/55 rounded-3xl border border-white/12 p-5 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-heading text-lg font-semibold">The grid at a glance</p>
            <p className="text-sm text-white/60">Read live from the Enerza API</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="relative flex size-2">
              <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Live
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <dt className="text-xs text-white/55">{stat.label}</dt>
              <dd className="font-heading nums mt-1 text-2xl font-semibold sm:text-3xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <ul className="mt-4 flex flex-col gap-2">
          {grid.zones.map((zone) => (
            <li
              key={zone.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm"
            >
              <span className="flex items-center gap-2.5 font-medium">
                <MapPin className="text-primary size-4" aria-hidden />
                {zone.name}
              </span>
              <span className="nums text-white/60">
                {zone.feederCount} feeders · {zone.areaNames.length} areas
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 flex items-start gap-2.5 text-xs leading-relaxed text-pretty text-white/60">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden />
          <span>
            {grid.totals.criticalFeeders} critical{" "}
            {grid.totals.criticalFeeders === 1 ? "feeder is" : "feeders are"} protected: hospitals
            and emergency services are never load-shed.
          </span>
        </p>
      </div>
    </div>
  );
}

export function Hero({ grid }: { grid: GridSnapshot | null }) {
  return (
    <section className="bg-ink text-ink-foreground relative isolate overflow-hidden">
      <Image
        src={images.heroTowersSunset.src}
        alt=""
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="-z-10 object-cover object-[75%_45%]"
      />
      <div
        aria-hidden
        className="from-ink via-ink/65 absolute inset-0 -z-10 bg-linear-to-r to-transparent"
      />
      <div
        aria-hidden
        className="from-ink to-ink/25 absolute inset-0 -z-10 bg-linear-to-t via-transparent"
      />
      <div aria-hidden className="bg-grid mask-radial absolute inset-0 -z-10 text-white/50" />

      <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-28">
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-start gap-7 duration-700">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-xs font-medium text-white/85 backdrop-blur-sm">
            <span aria-hidden className="bg-primary size-1.5 rounded-full" />
            Load shedding and outage management for Dhaka
          </span>

          <h1 className="text-[2.6rem] leading-[1.02] font-bold sm:text-6xl lg:text-7xl">
            Power you can <span className="text-gradient-volt">plan around.</span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            Know when load shedding starts and ends in your area. Report an outage in seconds and
            follow the repair. Pay your electricity bill online. One account does all three.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="xl">
              <Link href="/register">
                Create your account
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="glass">
              <Link href="/coverage">Check your area</Link>
            </Button>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            {promises.map((promise) => (
              <li key={promise} className="flex items-center gap-2">
                <Check className="text-primary size-4" aria-hidden />
                {promise}
              </li>
            ))}
          </ul>
        </div>

        <GridGlance grid={grid} />
      </Container>
    </section>
  );
}
