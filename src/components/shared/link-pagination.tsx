import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { toQueryString } from "@/lib/api/query-string";
import { cn } from "@/lib/utils";
import type { ApiMeta } from "@/types/api";

type LinkPaginationProps = {
  meta: ApiMeta;
  pathname: string;
  /** The current filters, carried over to every page link. */
  params: Record<string, string | number | undefined>;
};

/**
 * Pagination for server-rendered lists: plain links, so each page has its
 * own URL and works without JavaScript.
 */
export function LinkPagination({ meta, pathname, params }: LinkPaginationProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  const hrefFor = (page: number) =>
    `${pathname}${toQueryString({ ...params, page: page > 1 ? page : undefined })}`;
  const linkClass = buttonVariants({ variant: "outline", size: "lg" });

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
      <p className="text-muted-foreground nums text-sm">
        Page {meta.page} of {meta.totalPages} · {meta.total} results
      </p>
      <div className="flex gap-2">
        {meta.page > 1 ? (
          <Link href={hrefFor(meta.page - 1)} className={linkClass} scroll={false}>
            <ChevronLeft data-icon="inline-start" />
            Previous
          </Link>
        ) : (
          <span aria-disabled className={cn(linkClass, "pointer-events-none opacity-50")}>
            <ChevronLeft data-icon="inline-start" />
            Previous
          </span>
        )}
        {meta.page < meta.totalPages ? (
          <Link href={hrefFor(meta.page + 1)} className={linkClass} scroll={false}>
            Next
            <ChevronRight data-icon="inline-end" />
          </Link>
        ) : (
          <span aria-disabled className={cn(linkClass, "pointer-events-none opacity-50")}>
            Next
            <ChevronRight data-icon="inline-end" />
          </span>
        )}
      </div>
    </nav>
  );
}
