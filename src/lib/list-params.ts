import type { ListParams, SortOrder } from "@/lib/api/resources";

// A list page reads its filters from the URL twice: on the server, to
// prefetch the first page, and in the browser, to keep the table in step with
// the address bar. Both go through the helpers below, so they always build
// the same request and therefore the same cache key. Anything in the URL that
// is not a value the API accepts is dropped, never forwarded.

/** Reads one URL parameter. */
export type RawParams = (key: string) => string | undefined;

/** A RawParams over the `searchParams` a Server Component page receives. */
export const fromSearchParams = (
  searchParams: Record<string, string | string[] | undefined>,
): RawParams => {
  return (key) => {
    const value = searchParams[key];

    return Array.isArray(value) ? value[0] : value;
  };
};

export const oneOf = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined => (allowed.includes(value as T) ? (value as T) : undefined);

export const positiveInt = (value: string | undefined): number | undefined => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuid = (value: string | undefined) => (value && UUID.test(value) ? value : undefined);

/** "2026-10-09": the format of a date input, and what the API takes for from/to. */
export const isoDate = (value: string | undefined) =>
  value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;

/** "2026-10" */
export const isoMonth = (value: string | undefined) =>
  value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : undefined;

export const searchTerm = (value: string | undefined) => {
  const trimmed = value?.trim().slice(0, 100);

  return trimmed ? trimmed : undefined;
};

type PagingDefaults = {
  limit?: number;
  sortBy: string;
  sortOrder: SortOrder;
  /** The columns the API can sort by. */
  sortable: readonly string[];
};

/** Page, page size and sort order, falling back to the list's defaults. */
export const paging = (raw: RawParams, defaults: PagingDefaults): Required<ListParams> => ({
  page: positiveInt(raw("page")) ?? 1,
  limit: Math.min(positiveInt(raw("limit")) ?? defaults.limit ?? 10, 100),
  sortBy: oneOf(raw("sortBy"), defaults.sortable) ?? defaults.sortBy,
  sortOrder: oneOf(raw("sortOrder"), ["asc", "desc"] as const) ?? defaults.sortOrder,
});
