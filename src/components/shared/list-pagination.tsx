"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTableParams } from "@/hooks/use-url-state";
import type { ApiMeta } from "@/types/api";

/** Previous / next for card lists, with the page number kept in the URL. */
export function ListPagination({ meta }: { meta: ApiMeta | undefined }) {
  const { page, setPage } = useTableParams();

  if (!meta || meta.totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
      <p className="text-muted-foreground nums text-sm">
        Page {meta.page} of {meta.totalPages} · {meta.total} in total
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="lg" onClick={() => setPage(page - 1)} disabled={page <= 1}>
          <ChevronLeft data-icon="inline-start" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => setPage(page + 1)}
          disabled={page >= meta.totalPages}
        >
          Next
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </nav>
  );
}
