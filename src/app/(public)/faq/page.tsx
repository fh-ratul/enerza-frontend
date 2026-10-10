import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";
import { Button } from "@/components/ui/button";
import { faqGroups } from "@/features/faq/data";
import { images } from "@/lib/images";

export const metadata: Metadata = { title: "Frequently asked questions" };

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions, answered plainly"
        description="Everything here describes what the system actually does. If your question is not covered, send us a message."
        image={images.candleDark}
        imageClassName="object-[80%_50%]"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[14rem_1fr]">
          <nav aria-label="Topics" className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-muted-foreground mb-3 font-mono text-xs tracking-[0.16em] uppercase">
              Topics
            </p>
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {faqGroups.map((group) => (
                <li key={group.id}>
                  <a
                    href={`#${group.id}`}
                    className="hover:bg-muted bg-muted/60 lg:bg-transparent block rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {group.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-14">
            {faqGroups.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-24">
                <h2 className="text-2xl font-semibold sm:text-3xl">{group.title}</h2>
                <div className="bg-card mt-5 rounded-3xl border px-6">
                  <FaqAccordion items={group.items} idPrefix={group.id} />
                </div>
              </section>
            ))}

            <div className="bg-muted/50 flex flex-col items-start gap-4 rounded-3xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <h2 className="text-xl font-semibold">Still not sure?</h2>
                <p className="text-muted-foreground mt-1">
                  Write to us and a member of the support team will reply by email.
                </p>
              </div>
              <Button asChild size="xl">
                <Link href="/contact">
                  Contact support
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
