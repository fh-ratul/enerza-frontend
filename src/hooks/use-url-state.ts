"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import type { SortOrder } from "@/lib/api/resources";

type Updates = Record<string, string | number | boolean | null | undefined>;

/**
 * Filters, search, sorting and pagination live in the URL, so a view can be
 * bookmarked, shared and reached with the back button. This hook reads them
 * and writes them back with `router.replace`, which keeps the history clean
 * while someone is typing in a search box.
 */
export const useUrlState = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const get = useCallback((key: string) => searchParams.get(key) ?? undefined, [searchParams]);

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

      const query = next.toString();

      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const clear = useCallback(() => {
    startTransition(() => router.replace(pathname, { scroll: false }));
  }, [pathname, router]);

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
