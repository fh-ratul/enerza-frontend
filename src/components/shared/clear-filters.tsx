"use client";

import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUrlState } from "@/hooks/use-url-state";

/** Shown only while at least one of the given URL filters is set. */
export function ClearFilters({ keys }: { keys: string[] }) {
  const { get, set } = useUrlState();

  if (!keys.some((key) => get(key))) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={() => set(Object.fromEntries(keys.map((key) => [key, null])))}
    >
      <FilterX data-icon="inline-start" />
      Clear filters
    </Button>
  );
}
