"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useUrlState } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";

const PAUSE_MS = 350;

type SearchInputProps = {
  placeholder: string;
  /** The URL parameter this box reads and writes. */
  paramKey?: string;
  className?: string;
};

/**
 * A search box whose value lives in the URL. Typing updates the URL after a
 * short pause, so a search can be shared, bookmarked and restored on reload.
 */
export function SearchInput({ placeholder, paramKey = "searchTerm", className }: SearchInputProps) {
  const { get, set, isPending } = useUrlState();
  const current = get(paramKey) ?? "";
  const [value, setValue] = useState(current);
  // What the URL said at the last render, and what this box last wrote to it.
  const [seen, setSeen] = useState(current);
  const [written, setWritten] = useState(current);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // The pause outlives the render that started it: write through the latest `set`.
  const latestSet = useRef(set);

  useEffect(() => {
    latestSet.current = set;
  }, [set]);

  useEffect(() => () => clearTimeout(timer.current), []);

  // URL → box, when the URL changes from elsewhere ("Clear filters", a link).
  // A change this box caused itself is skipped: the visitor may have typed
  // more since, and that must not be replaced by their own earlier text.
  if (current !== seen) {
    setSeen(current);

    if (current !== written) {
      setValue(current);
      setWritten(current);
    }
  }

  // Box → URL, once the visitor pauses (at once when the box is cleared).
  const change = (text: string, pauseMs = PAUSE_MS) => {
    setValue(text);
    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      const term = text.trim();

      setWritten(term);
      latestSet.current({ [paramKey]: term });
    }, pauseMs);
  };

  return (
    <InputGroup className={cn("col-span-2 w-full sm:max-w-xs", className)}>
      <InputGroupAddon>{isPending ? <Spinner /> : <Search aria-hidden />}</InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(event) => change(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={100}
        className="[&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => change("", 0)}>
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}
