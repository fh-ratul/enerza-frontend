import { ArrowRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ROLE_HOME } from "@/lib/auth/config";
import { getSession } from "@/lib/auth/session";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";

function GuestActions() {
  return (
    <>
      <Button asChild variant="ghost" size="lg">
        <Link href="/login">Log in</Link>
      </Button>
      <Button asChild size="lg">
        <Link href="/register">
          Get started
          <ArrowRight data-icon="inline-end" />
        </Link>
      </Button>
    </>
  );
}

/**
 * The only part of the public header that depends on who is visiting. It
 * reads the session cookie, so it streams in behind a Suspense boundary and
 * the rest of the page stays static.
 */
async function AccountActions() {
  const session = await getSession();

  if (!session) {
    return <GuestActions />;
  }

  return (
    <Button asChild size="lg">
      <Link href={ROLE_HOME[session.role]}>
        <LayoutDashboard data-icon="inline-start" />
        Open dashboard
      </Link>
    </Button>
  );
}

export function SiteHeader() {
  const actions = (
    <Suspense fallback={<GuestActions />}>
      <AccountActions />
    </Suspense>
  );

  return (
    <header className="bg-background/80 supports-backdrop-filter:bg-background/65 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />
        <MainNav />
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden items-center gap-1.5 sm:flex">{actions}</div>
          <MobileNav actions={actions} />
        </div>
      </div>
    </header>
  );
}
