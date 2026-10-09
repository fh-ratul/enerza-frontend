"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * The last line of defence: shown when the root layout itself fails, so it
 * brings its own <html> and <body> and depends on nothing but the stylesheet.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center font-sans antialiased">
        <title>Something went wrong · Enerza</title>
        <div className="flex max-w-md flex-col gap-3">
          <h1 className="text-3xl font-semibold">Enerza could not load</h1>
          <p className="text-muted-foreground text-pretty">
            Something failed before the page could be shown. Try again; if it keeps happening, come
            back in a few minutes.
          </p>
          {error.digest ? (
            <p className="text-muted-foreground font-mono text-xs">Reference: {error.digest}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={retry}
            className="bg-primary text-primary-foreground h-11 rounded-xl px-5 font-medium"
          >
            Try again
          </button>
          {/* A plain link on purpose: the router may be what failed. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="h-11 rounded-xl border px-5 leading-11 font-medium">
            Go to the home page
          </a>
        </div>
      </body>
    </html>
  );
}
