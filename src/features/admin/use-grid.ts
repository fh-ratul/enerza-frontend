"use client";

import { useMemo } from "react";
import { useResource } from "@/hooks/use-resource";
import type { Feeder, Zone } from "@/types/api";
import { adminQueries } from "./queries";

export type GridSubstation = { id: string; name: string; code: string; zone: Zone };

/**
 * The grid as the admin screens need it: every feeder, and the zones and
 * substations they hang from (the API has no endpoint for those two on their
 * own; a feeder carries both).
 */
export const useGrid = () => {
  const query = useResource(adminQueries.grid, { staleTime: 5 * 60 * 1000 });

  return useMemo(() => {
    const feeders: Feeder[] = query.data?.data ?? [];
    const zones = new Map<string, Zone>();
    const substations = new Map<string, GridSubstation>();

    for (const feeder of feeders) {
      zones.set(feeder.substation.zone.id, feeder.substation.zone);
      substations.set(feeder.substation.id, feeder.substation);
    }

    const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

    return {
      feeders,
      zones: [...zones.values()].sort(byName),
      substations: [...substations.values()].sort(byName),
      zoneOptions: [...zones.values()].sort(byName).map((zone) => ({ value: zone.id, label: zone.name })),
      isLoading: query.isPending,
      isError: query.isError,
    };
  }, [query.data, query.isPending, query.isError]);
};
