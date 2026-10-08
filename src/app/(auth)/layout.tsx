import { CalendarClock, CircleCheck, Siren } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { images } from "@/lib/images";

const highlights = [
  {
    icon: CalendarClock,
    title: "Your feeder's schedule",
    body: "Every published load-shedding window, with the reason and the hours.",
  },
  {
    icon: Siren,
    title: "Outages, tracked",
    body: "From your report to the technician's closing note.",
  },
  {
    icon: CircleCheck,
    title: "Bills, settled",
    body: "Pay with bKash or a card. Marked paid when the gateway confirms.",
  },
];

/** Login and registration: the form on one side, the product on the other. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex flex-col px-4 py-5 sm:px-8">
        <header className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </header>
        <main id="main" className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-lg">{children}</div>
        </main>
        <footer className="text-muted-foreground flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/coverage" className="hover:text-foreground">
            Coverage
          </Link>
          <Link href="/faq" className="hover:text-foreground">
            FAQ
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact
          </Link>
        </footer>
      </div>

      <aside className="bg-ink text-ink-foreground relative isolate hidden overflow-hidden lg:flex lg:flex-col lg:justify-end">
        <Image
          src={images.dhakaNightStreet.src}
          alt={images.dhakaNightStreet.alt}
          fill
          priority
          placeholder="blur"
          sizes="48vw"
          className="-z-10 object-cover"
        />
        <div
          aria-hidden
          className="from-ink via-ink/70 absolute inset-0 -z-10 bg-linear-to-t to-transparent"
        />
        <div className="flex flex-col gap-8 p-10 xl:p-14">
          <p className="font-heading max-w-md text-4xl leading-[1.08] font-semibold xl:text-5xl">
            Power you can <span className="text-gradient-volt">plan around.</span>
          </p>
          <ul className="flex max-w-md flex-col gap-4">
            {highlights.map((item) => (
              <li
                key={item.title}
                className="bg-ink/55 flex gap-4 rounded-2xl border border-white/12 p-4 backdrop-blur-xl"
              >
                <span className="bg-primary text-primary-foreground grid size-10 shrink-0 place-items-center rounded-xl">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-sm text-white/65">{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
