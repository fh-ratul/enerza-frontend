import { Building2, MapPin, SearchX, ServerCrash, Zap } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { EmptyState } from "@/components/shared/empty-state";
import { LinkPagination } from "@/components/shared/link-pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatMW } from "@/lib/format";
import { FEEDER_PRIORITY } from "@/lib/status";
import type { Feeder } from "@/types/api";
import { searchFeeders } from "./public-data";

const PAGE_SIZE = 6;

// Whatever is in the URL is validated before it reaches the API; anything
// that does not fit is ignored rather than turned into an error page.
const paramsSchema = z.object({
  searchTerm: z.string().trim().min(1).max(100).optional().catch(undefined),
  zoneId: z.uuid().optional().catch(undefined),
  priority: z.enum(["CRITICAL", "HIGH", "NORMAL", "LOW"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

function FeederCard({ feeder }: { feeder: Feeder }) {
  const priority = FEEDER_PRIORITY[feeder.priority];

  return (
    <article className="bg-card flex flex-col gap-4 rounded-3xl border p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground font-mono text-xs">{feeder.code}</p>
          <h3 className="text-lg leading-snug font-semibold">{feeder.name}</h3>
        </div>
        <StatusBadge tone={priority.tone}>{priority.label}</StatusBadge>
      </header>

      <dl className="text-muted-foreground flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Substation and zone</dt>
          <Building2 className="size-4 shrink-0" aria-hidden />
          <dd>
            {feeder.substation.name} · {feeder.substation.zone.name}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Connected load</dt>
          <Zap className="size-4 shrink-0" aria-hidden />
          <dd className="nums">
            {formatMW(feeder.loadMW)} connected load
            {feeder.isActive ? "" : " · currently out of service"}
          </dd>
        </div>
      </dl>

      <div className="mt-auto border-t pt-4">
        <p className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
          <MapPin className="size-3.5" aria-hidden />
          Areas supplied
        </p>
        {feeder.areas.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {feeder.areas.map((area) => (
              <li key={area.id} className="bg-muted rounded-full px-2.5 py-1 text-xs font-medium">
                {area.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">No areas are attached to this feeder yet.</p>
        )}
      </div>
      <p className="text-muted-foreground text-xs">{priority.description}</p>
    </article>
  );
}

/**
 * The feeder directory for the current URL. A Server Component: the search
 * params are read here, behind the page's Suspense boundary, and the result
 * for each combination of filters is cached on the server.
 */
export async function CoverageResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = paramsSchema.parse({
    searchTerm: first(raw.searchTerm),
    zoneId: first(raw.zoneId),
    priority: first(raw.priority),
    page: first(raw.page),
  });

  const result = await searchFeeders({
    ...params,
    limit: PAGE_SIZE,
    sortBy: "code",
    sortOrder: "asc",
  });

  if (!result) {
    return (
      <EmptyState
        icon={ServerCrash}
        title="The feeder directory is unavailable"
        description="We could not reach the Enerza API just now. Please try again in a moment."
        action={
          <Button asChild variant="outline" size="lg">
            <Link href="/coverage">Try again</Link>
          </Button>
        }
      />
    );
  }

  if (result.data.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No feeders match"
        description="Try a different area name, or clear the filters to see the whole grid."
        action={
          <Button asChild variant="outline" size="lg">
            <Link href="/coverage">Clear filters</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {result.data.map((feeder) => (
          <li key={feeder.id} className="grid">
            <FeederCard feeder={feeder} />
          </li>
        ))}
      </ul>
      <LinkPagination
        meta={result.meta}
        pathname="/coverage"
        params={{
          searchTerm: params.searchTerm,
          zoneId: params.zoneId,
          priority: params.priority,
        }}
      />
    </div>
  );
}
