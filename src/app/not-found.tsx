import { ArrowLeft, MapPinned } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for does not exist on Enerza.",
};

const destinations = [
  { href: "/coverage", label: "Coverage", body: "Find the feeder that supplies your area" },
  { href: "/tariff", label: "Tariff", body: "See the rates and estimate a bill" },
  { href: "/faq", label: "FAQ", body: "How schedules, outages and bills work" },
];

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col">
      <div aria-hidden className="bg-grid mask-fade-b absolute inset-x-0 top-0 -z-10 h-[32rem] opacity-70" />
      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>

      <main id="main" className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-12">
        <div className="flex max-w-xl flex-col items-center gap-5 text-center">
          <p
            aria-hidden
            className="font-heading text-gradient-volt text-[7rem] leading-none font-semibold tracking-tighter sm:text-[10rem]"
          >
            404
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">This line is not on the grid</h1>
          <p className="text-muted-foreground text-lg text-pretty">
            The page you asked for does not exist, or it has moved. Check the address, or pick up
            from one of the places below.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="xl">
              <Link href="/">
                <ArrowLeft data-icon="inline-start" />
                Back to the home page
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>

        <ul className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {destinations.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="bg-card hover:border-foreground/25 focus-visible:ring-ring/50 flex h-full flex-col gap-1.5 rounded-2xl border p-5 transition-colors outline-none focus-visible:ring-3"
              >
                <span className="flex items-center gap-2 font-medium">
                  <MapPinned className="text-muted-foreground size-4" aria-hidden />
                  {item.label}
                </span>
                <span className="text-muted-foreground text-sm">{item.body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
