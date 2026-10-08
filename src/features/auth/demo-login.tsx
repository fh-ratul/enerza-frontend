"use client";

import { useQueryClient } from "@tanstack/react-query";
import { HardHat, Home, type LucideIcon, TowerControl } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Role } from "@/types/api";
import { demoLoginAction } from "./actions";

const demos: { role: Role; slug: string; icon: LucideIcon; title: string; body: string }[] = [
  {
    role: "CUSTOMER",
    slug: "customer",
    icon: Home,
    title: "Customer",
    body: "Schedule, outage reports, bills and payments",
  },
  {
    role: "TECHNICIAN",
    slug: "technician",
    icon: HardHat,
    title: "Technician",
    body: "Assigned jobs, status updates and performance",
  },
  {
    role: "ADMIN",
    slug: "admin",
    icon: TowerControl,
    title: "Admin",
    body: "Grid, schedules, dispatch, billing and audit",
  },
];

/**
 * One-click logins for the three roles. The button only names a role; the
 * server looks up that role's demo credentials and logs in.
 */
export function DemoLogin() {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  const login = (role: Role) => {
    setActiveRole(role);

    startTransition(async () => {
      queryClient.clear();

      const result = await demoLoginAction(role);

      if (result && !result.ok) {
        toast.error(result.message);
        setActiveRole(null);
      }
    });
  };

  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {demos.map((demo) => {
        const isLoading = isPending && activeRole === demo.role;

        return (
          <li
            key={demo.role}
            className="bg-card flex flex-row items-center gap-3 rounded-2xl border p-4 sm:flex-col sm:items-stretch sm:gap-4"
          >
            <div className="flex flex-1 items-center gap-3 sm:flex-col sm:items-start">
              <span className="bg-ink text-primary grid size-10 shrink-0 place-items-center rounded-xl">
                <demo.icon className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{demo.title}</span>
                <span className="text-muted-foreground text-xs leading-snug">{demo.body}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isPending}
              onClick={() => login(demo.role)}
              data-demo-role={demo.slug}
              aria-label={`Demo login as ${demo.title.toLowerCase()}`}
              className="sm:w-full"
            >
              {isLoading ? <Spinner /> : null}
              {isLoading ? "Signing in…" : "Demo login"}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
