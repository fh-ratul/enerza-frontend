"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useTransition } from "react";
import type { SortOrder } from "@/lib/api/resources";

type Updates = Record<string, string | number | boolean | null | undefined>;

/**
 * How a change to the URL's query string is applied.
 *
 * - "navigate": a router navigation, so Server Components that read
 *   `searchParams` render again. The public pages work this way.
 * - "shallow": only the address bar changes (History API). The dashboards work
 *   this way: their lists are fetched in the browser by TanStack Query, so a
 *   filter responds at once instead of waiting for a server round trip.
 */
export type UrlStateMode = "navigate" | "shallow";

export const UrlStateModeContext = createContext<UrlStateMode>("navigate");

/**
 * Filters, search, sorting and pagination live in the URL, so a view can be
 * bookmarked, shared and restored on reload. This hook reads them and writes
 * them back by replacing the current history entry, which keeps the history
 * clean while someone is typing in a search box.
 */
export const useUrlState = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = useContext(UrlStateModeContext);
  const [isPending, startTransition] = useTransition();

  const get = useCallback((key: string) => searchParams.get(key) ?? undefined, [searchParams]);

  const go = useCallback(
    (query: string) => {
      const url = query ? `${pathname}?${query}` : pathname;

      if (mode === "shallow") {
        // Next.js keeps useSearchParams() in step with the History API.
        window.history.replaceState(null, "", url);
      } else {
        startTransition(() => router.replace(url, { scroll: false }));
      }
    },
    [mode, pathname, router],
  );

  /**
   * Sets or removes (null / undefined / "") any number of params at once.
   * Changing a filter goes back to page 1 unless `page` is part of the update.
   */
  const set = useCallback(
    (updates: Updates) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      if (!("page" in updates)) {
        next.delete("page");
      }

      go(next.toString());
    },
    [go, searchParams],
  );

  const clear = useCallback(() => go(""), [go]);

  return { get, set, clear, isPending, searchParams };
};

type TableDefaults = { limit?: number; sortBy?: string; sortOrder?: SortOrder };

const toPositiveInt = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

/** Pagination and sorting from the URL, with defaults for what is not there. */
export const useTableParams = (defaults: TableDefaults = {}) => {
  const url = useUrlState();
  const { get, set } = url;

  const page = toPositiveInt(get("page"), 1);
  const limit = Math.min(toPositiveInt(get("limit"), defaults.limit ?? 10), 100);
  const sortBy = get("sortBy") ?? defaults.sortBy;
  const sortOrder: SortOrder | undefined =
    get("sortOrder") === "asc" ? "asc" : get("sortOrder") === "desc" ? "desc" : defaults.sortOrder;

  const setPage = useCallback((next: number) => set({ page: next <= 1 ? null : next }), [set]);
  const setLimit = useCallback((next: number) => set({ limit: next }), [set]);

  /** Click a column: sort by it; click again: flip the direction. */
  const toggleSort = useCallback(
    (column: string) => {
      const isSame = sortBy === column;

      set({ sortBy: column, sortOrder: isSame && sortOrder === "asc" ? "desc" : "asc" });
    },
    [set, sortBy, sortOrder],
  );

  return useMemo(
    () => ({ ...url, page, limit, sortBy, sortOrder, setPage, setLimit, toggleSort }),
    [url, page, limit, sortBy, sortOrder, setPage, setLimit, toggleSort],
  );
};
