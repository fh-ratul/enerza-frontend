import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { backendRequest } from "@/lib/api/backend";
import type { FeederListParams } from "@/lib/api/resources";
import { PUBLIC_FEEDERS_TAG } from "@/lib/api/tags";
import type { ApiMeta, Feeder, FeederPriority, Zone } from "@/types/api";

// The public pages read the grid from the API's one public endpoint. Each
// read is cached ("use cache"), so the pages stay static and are refreshed in
// the background every few minutes, or at once when an admin edits a feeder.
//
// A failed read returns null instead of throwing: a marketing page should
// still render, and build, when the API happens to be unreachable.

export type GridZone = Zone & {
  substations: { id: string; name: string; code: string; feederCount: number }[];
  feederCount: number;
  areaNames: string[];
  loadMW: number;
};

export type GridSnapshot = {
  totals: {
    zones: number;
    substations: number;
    feeders: number;
    areas: number;
    loadMW: number;
    criticalFeeders: number;
  };
  zones: GridZone[];
  byPriority: Record<FeederPriority, number>;
  feeders: Feeder[];
};

const summarise = (feeders: Feeder[]): GridSnapshot => {
  const zones = new Map<string, GridZone>();
  const byPriority: Record<FeederPriority, number> = { CRITICAL: 0, HIGH: 0, NORMAL: 0, LOW: 0 };
  let loadCentiMW = 0;
  let areas = 0;
  const substationIds = new Set<string>();

  for (const feeder of feeders) {
    const { zone, ...substation } = feeder.substation;
    const entry: GridZone = zones.get(zone.id) ?? {
      ...zone,
      substations: [],
      feederCount: 0,
      areaNames: [],
      loadMW: 0,
    };
    const feederCentiMW = Math.round(Number(feeder.loadMW) * 100);
    const known = entry.substations.find(({ id }) => id === substation.id);

    if (known) {
      known.feederCount += 1;
    } else {
      entry.substations.push({ ...substation, feederCount: 1 });
    }

    entry.feederCount += 1;
    entry.areaNames.push(...feeder.areas.map((area) => area.name));
    entry.loadMW = (Math.round(entry.loadMW * 100) + feederCentiMW) / 100;
    zones.set(zone.id, entry);

    byPriority[feeder.priority] += 1;
    loadCentiMW += feederCentiMW;
    areas += feeder.areas.length;
    substationIds.add(substation.id);
  }

  return {
    totals: {
      zones: zones.size,
      substations: substationIds.size,
      feeders: feeders.length,
      areas,
      loadMW: loadCentiMW / 100,
      criticalFeeders: byPriority.CRITICAL,
    },
    zones: [...zones.values()].sort((a, b) => a.code.localeCompare(b.code)),
    byPriority,
    feeders,
  };
};

/** The whole grid, summarised: zones, substations, feeders, areas and load. */
export async function getGridSnapshot(): Promise<GridSnapshot | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_FEEDERS_TAG);

  try {
    const { data } = await backendRequest<Feeder[]>("/feeders", {
      query: { limit: 100, sortBy: "code", sortOrder: "asc" },
    });

    return summarise(data);
  } catch {
    return null;
  }
}

/** One page of the feeder directory, for the coverage page's search and filters. */
export async function searchFeeders(
  params: FeederListParams,
): Promise<{ data: Feeder[]; meta: ApiMeta } | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(PUBLIC_FEEDERS_TAG);

  try {
    const { data, meta } = await backendRequest<Feeder[]>("/feeders", { query: params });

    return meta ? { data, meta } : null;
  } catch {
    return null;
  }
}
