"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { QueryError } from "@/components/shared/query-error";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTableParams } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";
import type { ApiMeta } from "@/types/api";

const HIDE_BELOW = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
} as const;

export type Column<T> = {
  /** Unique per table; also the `sortBy` value when the column is sortable. */
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right";
  /** Drop the column below this breakpoint, so narrow screens keep the essentials. */
  hideBelow?: keyof typeof HIDE_BELOW;
  className?: string;
};

type DataTableProps<T> = {
  /** Read by screen readers as the table's name. */
  caption: string;
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowId: (row: T) => string;
  meta?: ApiMeta;
  /** First load: nothing to show yet. */
  isLoading?: boolean;
  /** A newer page is on its way while the previous one is still shown. */
  isFetching?: boolean;
  error?: unknown;
  onRetry?: () => void;
  empty: { icon: LucideIcon; title: string; description: ReactNode; action?: ReactNode };
  /** Default sort (and page size), used when the URL names none. */
  defaultSort?: { sortBy: string; sortOrder: "asc" | "desc"; limit?: number };
  onRowClick?: (row: T) => void;
};

const PAGE_SIZES = [10, 20, 50];

/**
 * The table behind every list in the dashboards. Sorting and paging are read
 * from and written to the URL (useTableParams), so a view can be bookmarked,
 * shared and restored with the Back button.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowId,
  meta,
  isLoading = false,
  isFetching = false,
  error,
  onRetry,
  empty,
  defaultSort,
  onRowClick,
}: DataTableProps<T>) {
  const { page, limit, sortBy, sortOrder, setPage, setLimit, toggleSort } = useTableParams(defaultSort);

  if (error && !rows) {
    return <QueryError error={error} onRetry={() => onRetry?.()} />;
  }

  if (!isLoading && rows && rows.length === 0) {
    return <EmptyState {...empty} />;
  }

  const totalPages = meta?.totalPages ?? 1;
  const firstRow = meta ? (meta.page - 1) * meta.limit + 1 : 1;
  const lastRow = meta ? Math.min(meta.page * meta.limit, meta.total) : (rows?.length ?? 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card overflow-hidden rounded-2xl border">
        {/* While a new page loads the old one stays, dimmed: no flash, no jump. */}
        <Table
          aria-busy={isLoading || isFetching}
          className={cn("transition-opacity", isFetching && !isLoading && "opacity-60")}
        >
          <caption className="sr-only">{caption}</caption>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {columns.map((column) => {
                const isSorted = column.sortable && sortBy === column.id;
                const SortIcon = !isSorted ? ArrowUpDown : sortOrder === "asc" ? ArrowUp : ArrowDown;

                return (
                  <TableHead
                    key={column.id}
                    aria-sort={
                      isSorted ? (sortOrder === "asc" ? "ascending" : "descending") : undefined
                    }
                    className={cn(
                      "text-muted-foreground h-11 px-3 text-xs font-medium sm:px-4",
                      column.align === "right" && "text-right",
                      column.hideBelow && HIDE_BELOW[column.hideBelow],
                      column.className,
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.id)}
                        className={cn(
                          "hover:text-foreground focus-visible:ring-ring/60 -mx-1.5 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 outline-none focus-visible:ring-3",
                          isSorted && "text-foreground",
                        )}
                      >
                        {column.header}
                        <SortIcon className="size-3.5" aria-hidden />
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !rows
              ? Array.from({ length: Math.min(limit, 8) }, (_, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-transparent">
                    {columns.map((column, columnIndex) => (
                      <TableCell
                        key={column.id}
                        className={cn("px-4 py-3.5", column.hideBelow && HIDE_BELOW[column.hideBelow])}
                      >
                        <Skeleton
                          className={cn("h-4", columnIndex === 0 ? "w-40" : "w-20")}
                          style={{ opacity: 1 - rowIndex * 0.09 }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows.map((row) => (
                  <TableRow
                    key={getRowId(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          "px-3 py-3 align-middle sm:px-4",
                          column.align === "right" && "text-right",
                          column.hideBelow && HIDE_BELOW[column.hideBelow],
                          column.className,
                        )}
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {meta ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground nums text-sm" aria-live="polite">
            {meta.total === 0 ? "No results" : `${firstRow}–${lastRow} of ${meta.total}`}
          </p>
          <div className="flex items-center gap-3">
            <label className="text-muted-foreground flex items-center gap-2 text-sm">
              <span className="hidden sm:inline">Rows per page</span>
              <Select value={String(limit)} onValueChange={(value) => setLimit(Number(value))}>
                <SelectTrigger size="sm" className="w-18" aria-label="Rows per page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <nav aria-label="Pagination" className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft />
              </Button>
              <span className="nums min-w-20 text-center text-sm">
                Page {meta.page} of {Math.max(totalPages, 1)}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight />
              </Button>
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
