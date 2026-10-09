import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  // A page about one customer's payment has no business in a search index.
  robots: { index: false, follow: false },
};

/** A quiet frame for the pages a payment gateway sends the customer back to. */
export default function CheckoutLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative isolate flex min-h-dvh flex-1 flex-col">
      <div aria-hidden className="bg-grid mask-fade-b absolute inset-x-0 top-0 -z-10 h-96 opacity-60" />
      <header className="flex items-center justify-between px-4 py-5 sm:px-8">
        <Logo href="/dashboard" />
        <ThemeToggle />
      </header>
      <main id="main" className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>
      <footer className="text-muted-foreground flex flex-wrap justify-center gap-x-5 gap-y-1 px-4 py-6 text-xs">
        <Link href="/dashboard/bills" className="hover:text-foreground">
          Bills
        </Link>
        <Link href="/dashboard/payments" className="hover:text-foreground">
          Payment history
        </Link>
        <Link href="/contact" className="hover:text-foreground">
          Contact
        </Link>
      </footer>
    </div>
  );
}
