"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { marketingNav } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Desktop navigation of the public site, with the current page marked. */
export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
      {marketingNav.map(({ href, label }) => {
        const isCurrent = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring/60 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3",
              isCurrent && "text-foreground bg-muted",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
