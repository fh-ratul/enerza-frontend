import { Clock, MapPin, MessageSquare } from "lucide-react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { siteConfig } from "@/lib/site";

const columns = [
  {
    title: "Service",
    links: [
      { href: "/services", label: "What Enerza does" },
      { href: "/coverage", label: "Coverage map" },
      { href: "/tariff", label: "Tariff & bill estimator" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Create an account" },
      { href: "/dashboard/outages", label: "Report an outage" },
      { href: "/dashboard/bills", label: "Pay a bill" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground relative overflow-hidden">
      <div aria-hidden className="bg-grid mask-fade-b absolute inset-0 text-white/60" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div className="flex max-w-sm flex-col gap-5">
            <Link href="/" className="inline-flex items-center gap-2.5 self-start">
              <LogoMark />
              <span className="font-heading text-xl font-bold tracking-tight">Enerza</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/65">{siteConfig.description}</p>
            <ul className="flex flex-col gap-2.5 text-sm text-white/75">
              <li className="flex items-center gap-2.5">
                <Clock className="text-primary size-4 shrink-0" aria-hidden />
                <span>Outage reporting is open 24 hours a day, in the app</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageSquare className="text-primary size-4 shrink-0" aria-hidden />
                <Link href="/contact" className="hover:underline">
                  Send us a message
                </Link>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="text-primary size-4 shrink-0" aria-hidden />
                <span>Serving {siteConfig.serviceArea}</span>
              </li>
            </ul>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-3.5">
                <h2 className="font-mono text-xs font-medium tracking-[0.16em] text-white/45 uppercase">
                  {column.title}
                </h2>
                <ul className="flex flex-col gap-2.5 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-white/75 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Enerza. Load shedding and power outage management for Dhaka.</p>
          <p>All times are shown in Asia/Dhaka. Payments are processed in test mode.</p>
        </div>
      </div>
    </footer>
  );
}
