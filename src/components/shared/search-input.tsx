"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/use-debounce";
import { useUrlState } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";

type SearchInputProps = {
  placeholder: string;
  /** The URL parameter this box reads and writes. */
  paramKey?: string;
  className?: string;
};

/**
 * A search box whose value lives in the URL. Typing updates the URL after a
 * short pause, so a search can be shared, bookmarked and undone with Back.
 */
export function SearchInput({ placeholder, paramKey = "searchTerm", className }: SearchInputProps) {
  const { get, set, isPending } = useUrlState();
  const current = get(paramKey) ?? "";
  const [value, setValue] = useState(current);
  const debounced = useDebounce(value.trim());

  // Typing → URL, once the visitor pauses.
  useEffect(() => {
    if (debounced !== current) {
      set({ [paramKey]: debounced });
    }
    // Only the debounced value should trigger this; `current` and `set` follow from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // URL → box, when the URL changes from elsewhere (Back button, "clear filters").
  useEffect(() => {
    setValue(current);
  }, [current]);

  return (
    <InputGroup className={cn("w-full sm:max-w-xs", className)}>
      <InputGroupAddon>
        {isPending ? <Spinner /> : <Search aria-hidden />}
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={100}
        className="[&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => setValue("")}>
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}
