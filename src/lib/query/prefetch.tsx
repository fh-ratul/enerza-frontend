import "server-only";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cache, type ReactNode } from "react";
import type { Resource } from "@/lib/api/resources";
import { serverApi } from "@/lib/api/server";
import { makeQueryClient } from "./client";

/** The query client of the current request. */
const getQueryClient = cache(makeQueryClient);

type PrefetchProps = {
  resources: Resource<unknown>[];
  children: ReactNode;
};

/**
 * Fetches resources on the server, with the visitor's cookie, and hands the
 * results to the client components underneath: their `useResource()` calls
 * find the data already cached, so the first paint is complete and the
 * browser makes no request of its own until the data goes stale.
 *
 * A resource that fails to load is simply left out. The client component then
 * fetches it itself and shows its own error state, instead of the whole page
 * falling over.
 */
export async function Prefetch({ resources, children }: PrefetchProps) {
  const queryClient = getQueryClient();

  await Promise.all(
    resources.map((resource) =>
      queryClient.prefetchQuery({
        queryKey: resource.queryKey,
        queryFn: () => serverApi.get(resource.path, resource.query),
      }),
    ),
  );

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
