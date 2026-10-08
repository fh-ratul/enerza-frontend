import { defaultShouldDehydrateQuery, isServer, QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/lib/api/errors";

const MAX_RETRIES = 2;

export const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Data handed over by the server is fresh: do not refetch it on mount.
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        // A 4xx is an answer, not a glitch: retrying it only delays the error.
        retry: (failureCount, error) =>
          failureCount < MAX_RETRIES && !(isApiError(error) && error.statusCode < 500),
      },
      mutations: {
        retry: false,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query),
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

/**
 * One client per request on the server (so visitors never share a cache),
 * one for the lifetime of the tab in the browser.
 */
export const getBrowserQueryClient = () => {
  if (isServer) {
    return makeQueryClient();
  }

  browserQueryClient ??= makeQueryClient();

  return browserQueryClient;
};
