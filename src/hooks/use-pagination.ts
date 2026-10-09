"use client";

import { useMemo } from "react";
import { useTableParams } from "@/hooks/use-url-state";
import type { ApiMeta } from "@/types/api";

/**
 * Pages through a list that is already in memory, with the page number and
 * page size kept in the URL like every other list. Returns the rows of the
 * current page and the same `meta` the API sends for a list it pages itself,
 * so the result drops straight into a DataTable.
 */
export const usePagination = <T>(items: T[], defaults: { limit?: number } = {}) => {
  const { page, limit } = useTableParams(defaults);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  // A page number left over from a longer list falls back to the last page.
  const current = Math.min(page, totalPages);

  const rows = useMemo(
    () => items.slice((current - 1) * limit, current * limit),
    [items, current, limit],
  );

  const meta: ApiMeta = { page: current, limit, total, totalPages };

  return { rows, meta };
};
