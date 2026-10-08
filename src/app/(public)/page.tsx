import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CoverageTeaser } from "@/components/marketing/coverage-teaser";
import { CtaBand } from "@/components/marketing/cta-band";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { FeatureBento } from "@/components/marketing/feature-bento";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { RoleCards } from "@/components/marketing/role-cards";
import { RuleStrip } from "@/components/marketing/rule-strip";
import { Section, SectionHeading } from "@/components/marketing/section";
import { TariffTable } from "@/components/marketing/tariff-table";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { featuredFaqs } from "@/features/faq/data";
import { getGridSnapshot } from "@/features/grid/public-data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  // Cached ("use cache"), so this page is prerendered with real grid figures.
  const grid = await getGridSnapshot();

  return (
    <>
      <Hero grid={grid} />
      <RuleStrip />
      <FeatureBento />
      <HowItWorks />
      <RoleCards />
      <CoverageTeaser grid={grid} />

      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <SectionHeading
              eyebrow="Tariff"
              title="Know what you will pay before the bill arrives"
              description="Residential bills are charged in slabs: each slice of your consumption at its own rate. Enter a meter reading in the estimator and see the bill the system would issue, line by line."
            />
            <Button asChild size="xl" variant="outline" className="self-start">
              <Link href="/tariff">
                Open the bill estimator
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <Reveal>
            <TariffTable />
          </Reveal>
        </div>
      </Section>

      <Section className="bg-muted/40 border-y">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col gap-8">
            <SectionHeading
              eyebrow="Questions"
              title="Asked often, answered plainly"
              description="How the schedule is decided, what happens to your report, and how payment works."
            />
            <Button asChild size="xl" variant="outline" className="self-start">
              <Link href="/faq">
                Read all questions
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <div className="bg-card rounded-3xl border px-6">
            <FaqAccordion items={featuredFaqs} idPrefix="home" />
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
