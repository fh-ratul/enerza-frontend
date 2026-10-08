"use client";

import { RefreshCw, ServerCrash } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api/errors";

type QueryErrorProps = {
  error: unknown;
  /** The query's `refetch`. */
  onRetry: () => void;
  title?: string;
  className?: string;
};

/** What a section shows when its data could not be loaded, with a way to try again. */
export function QueryError({
  error,
  onRetry,
  title = "This could not be loaded",
  className,
}: QueryErrorProps) {
  return (
    <EmptyState
      icon={ServerCrash}
      title={title}
      description={getErrorMessage(error)}
      className={className}
      action={
        <Button variant="outline" size="lg" onClick={onRetry}>
          <RefreshCw data-icon="inline-start" />
          Try again
        </Button>
      }
    />
  );
}
