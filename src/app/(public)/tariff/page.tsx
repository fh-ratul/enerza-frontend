import { CalendarCheck, CreditCard, type LucideIcon, ReceiptText, Smartphone } from "lucide-react";
import type { Metadata } from "next";
import { CtaBand } from "@/components/marketing/cta-band";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionHeading } from "@/components/marketing/section";
import { TariffTable } from "@/components/marketing/tariff-table";
import { Reveal } from "@/components/shared/reveal";
import { BillEstimator } from "@/features/tariff/bill-estimator";
import { images } from "@/lib/images";
import { BILL_DUE_DAYS, VAT_PERCENT } from "@/lib/tariff";

export const metadata: Metadata = {
  title: "Tariff and bill estimator",
  description:
    "The residential slab tariff, the commercial rate, the demand charge and VAT, with an estimator that shows your electricity bill line by line.",
  alternates: { canonical: "/tariff" },
  openGraph: {
    title: "Tariff and bill estimator · Enerza",
    description: "See how an electricity bill is calculated, slab by slab, and estimate your own.",
  },
};

const steps: { title: string; body: string }[] = [
  {
    title: "Units consumed",
    body: "The reading taken at your meter this month, minus the reading your last bill ended on.",
  },
  {
    title: "Energy charge",
    body: "Residential: each slice of units at its own slab's rate, so only the units above a limit cost more. Commercial: every unit at one flat rate.",
  },
  {
    title: "Demand charge",
    body: "A fixed amount per kilowatt of the load your connection is approved for. It applies even in a month with no consumption.",
  },
  {
    title: `VAT at ${VAT_PERCENT}%`,
    body: "Charged on the energy charge and the demand charge together, rounded to the nearest paisa.",
  },
];

const facts: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: CalendarCheck,
    title: `Due in ${BILL_DUE_DAYS} days`,
    body: "A bill is due two weeks after it is issued. After that it shows as overdue, and can still be paid online.",
  },
  {
    icon: Smartphone,
    title: "Pay with bKash",
    body: "Approve the payment in your bKash wallet. The bill is settled when bKash confirms the transaction.",
  },
  {
    icon: CreditCard,
    title: "Or through SSLCommerz",
    body: "Debit and credit cards, mobile banking and internet banking, on SSLCommerz's own checkout page.",
  },
  {
    icon: ReceiptText,
    title: "Receipt by email",
    body: "Every settled payment sends a receipt with the bill number, the amount and the gateway's transaction id.",
  },
];

export default function TariffPage() {
  return (
    <>
      <PageHero
        eyebrow="Tariff"
        title="What a unit costs, and how a bill adds up"
        description="No hidden lines. The rates below are the ones the billing system uses, and the estimator runs the same arithmetic."
        image={images.cardPayment}
        imageClassName="object-[60%_50%]"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col gap-8">
            <SectionHeading
              eyebrow="Rates"
              title="Residential slabs"
              description="The more you use, the more the next unit costs, but only the units above each limit are charged at the higher rate."
            />
            <TariffTable />
            <p className="text-muted-foreground text-sm">
              Rates are illustrative and are not an official BERC tariff order.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <SectionHeading eyebrow="Estimator" title="Try it with your own readings" />
            <BillEstimator />
          </div>
        </div>
      </Section>

      <Section className="bg-muted/40 border-y">
        <SectionHeading
          eyebrow="The calculation"
          title="Four steps from meter reading to total"
          align="center"
        />
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.06}>
              <li className="bg-card flex h-full flex-col gap-3 rounded-3xl border p-6">
                <span className="text-muted-foreground font-mono text-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section>
        <SectionHeading eyebrow="Paying" title="Due dates, gateways and receipts" />
        <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <li key={fact.title} className="flex flex-col gap-3">
              <span className="bg-ink text-primary grid size-11 place-items-center rounded-2xl">
                <fact.icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-semibold">{fact.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{fact.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        title="Ready to see your real bill?"
        description="Log in to check this month's readings and charges, and pay in a couple of taps."
      />
    </>
  );
}
