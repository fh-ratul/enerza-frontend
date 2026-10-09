"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ErrorViewProps = {
  error: Error & { digest?: string };
  retry: () => void;
  /** Where "go back" leads: the section's own home. */
  homeHref: string;
  homeLabel: string;
};

/** What an error boundary shows: what happened in plain words, and two ways out. */
export function ErrorView({ error, retry, homeHref, homeLabel }: ErrorViewProps) {
  useEffect(() => {
    // The browser console is the only log this app has; the server logs its own side.
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center"
    >
      <span className="bg-destructive/10 text-destructive grid size-16 place-items-center rounded-full">
        <TriangleAlert className="size-8" aria-hidden />
      </span>
      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-2xl font-semibold sm:text-3xl">Something went wrong</h1>
        <p className="text-muted-foreground text-pretty">
          This page hit an unexpected problem. Nothing you entered elsewhere is lost. Try again, and
          if it keeps happening, tell us what you were doing.
        </p>
        {error.digest ? (
          <p className="text-muted-foreground font-mono text-xs">Reference: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="xl" onClick={retry}>
          <RefreshCw data-icon="inline-start" />
          Try again
        </Button>
        <Button asChild variant="outline" size="xl">
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
