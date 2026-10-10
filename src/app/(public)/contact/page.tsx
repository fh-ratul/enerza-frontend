import { ArrowUpRight, CircleHelp, type LucideIcon, Receipt, Siren } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";
import { ContactForm } from "@/features/contact/contact-form";
import { images } from "@/lib/images";

export const metadata: Metadata = { title: "Contact" };

const shortcuts: { icon: LucideIcon; title: string; body: string; href: string; cta: string }[] = [
  {
    icon: Siren,
    title: "Power out right now?",
    body: "Report it from your dashboard. It reaches the control room at once, and you can follow the repair.",
    href: "/dashboard/outages",
    cta: "Report an outage",
  },
  {
    icon: Receipt,
    title: "A question about a bill?",
    body: "Each bill shows its readings and the full calculation. The tariff page explains every line.",
    href: "/tariff",
    cta: "See how bills are calculated",
  },
  {
    icon: CircleHelp,
    title: "Looking for a quick answer?",
    body: "Schedules, outages, payments and accounts are covered in the frequently asked questions.",
    href: "/faq",
    cta: "Read the FAQ",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the people behind the grid"
        description="Write to us about anything Enerza does. We reply by email."
        image={images.dhakaNeon}
        imageClassName="object-[50%_35%]"
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold sm:text-3xl">Often faster than a message</h2>
            <ul className="mt-2 flex flex-col gap-4">
              {shortcuts.map((shortcut) => (
                <li key={shortcut.title}>
                  <Link
                    href={shortcut.href}
                    className="group bg-card hover:border-foreground/25 focus-visible:ring-ring/60 flex gap-4 rounded-3xl border p-5 transition-colors outline-none focus-visible:ring-3 sm:p-6"
                  >
                    <span className="bg-ink text-primary grid size-11 shrink-0 place-items-center rounded-2xl">
                      <shortcut.icon className="size-5" aria-hidden />
                    </span>
                    <span className="flex flex-col gap-1.5">
                      <span className="font-semibold">{shortcut.title}</span>
                      <span className="text-muted-foreground text-sm leading-relaxed">
                        {shortcut.body}
                      </span>
                      <span className="text-brand mt-1 inline-flex items-center gap-1 text-sm font-medium">
                        {shortcut.cta}
                        <ArrowUpRight
                          className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden
                        />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card rounded-3xl border p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">Send a message</h2>
            <p className="text-muted-foreground mt-1.5 mb-6">
              All fields are required. Your email address is used only to reply to you.
            </p>
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
