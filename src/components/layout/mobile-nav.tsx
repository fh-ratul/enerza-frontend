"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { marketingNav } from "@/lib/site";
import { cn } from "@/lib/utils";

/** The public site's navigation on small screens. `actions` are the account buttons. */
export function MobileNav({ actions }: { actions: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(22rem,88vw)] gap-0 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle asChild>
            <div>
              <Logo />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1 p-3">
          {marketingNav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={pathname === href ? "page" : undefined}
              className={cn(
                "hover:bg-muted rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                pathname === href && "bg-muted",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        {/* Clicking through to an account page closes the menu as well. */}
        <div
          className="mt-auto flex flex-col gap-2 border-t p-4 *:w-full"
          onClick={() => setOpen(false)}
        >
          {actions}
        </div>
      </SheetContent>
    </Sheet>
  );
}
