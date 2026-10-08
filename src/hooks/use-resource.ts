"use client";

import { keepPreviousData, useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Resource } from "@/lib/api/resources";
import type { ApiResult } from "@/types/api";

type Options<T> = Omit<
  UseQueryOptions<ApiResult<T>, ApiError, ApiResult<T>>,
  "queryKey" | "queryFn"
> & {
  /** Keep showing the previous page while the next one loads (lists and tables). */
  keepPrevious?: boolean;
};

/**
 * Reads an API resource through TanStack Query. On a page that prefetched the
 * same resource on the server, the data is there on the first render.
 */
export const useResource = <T>(resource: Resource<T>, options: Options<T> = {}) => {
  const { keepPrevious, ...queryOptions } = options;

  return useQuery<ApiResult<T>, ApiError>({
    queryKey: resource.queryKey,
    queryFn: ({ signal }) => api.get<T>(resource.path, { query: resource.query, signal }),
    placeholderData: keepPrevious ? keepPreviousData : undefined,
    ...queryOptions,
  });
};
