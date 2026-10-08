export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

/**
 * Builds "?a=1&b=two", leaving out empty values, with keys in a stable order
 * so the same filters always produce the same URL (and the same cache key).
 */
export const toQueryString = (params?: QueryParams): string => {
  if (!params) {
    return "";
  }

  const search = new URLSearchParams();

  for (const key of Object.keys(params).sort()) {
    const value = params[key];

    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();

  return query ? `?${query}` : "";
};

/** The same params without the empty ones: what ends up in a query key. */
export const compactParams = <T extends QueryParams>(params: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  ) as Partial<T>;
