"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { useResource } from "@/hooks/use-resource";
import { resources } from "@/lib/api/resources";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/types/api";

type CustomerComboboxProps = {
  id?: string;
  /** The chosen customer's profile id (not their user id). */
  value: string;
  onChange: (customerId: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
};

/**
 * Finds a customer by name, email or meter number. The search runs on the
 * API as the admin types, after a short pause, so it works however many
 * customers there are.
 */
export function CustomerCombobox({ id, value, onChange, onBlur, invalid }: CustomerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [chosen, setChosen] = useState<AdminUser | null>(null);
  const searchTerm = useDebounce(term.trim());
  const query = useResource(
    resources.users({
      role: "CUSTOMER",
      status: "ACTIVE",
      searchTerm: searchTerm || undefined,
      limit: 8,
      sortBy: "name",
      sortOrder: "asc",
    }),
    { enabled: open, keepPrevious: true },
  );
  const customers = (query.data?.data ?? []).filter((user) => user.customer);
  const selected = chosen?.customer?.id === value ? chosen : null;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (!next) {
          onBlur?.();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className="h-9 w-full justify-between px-3 font-normal"
        >
          {selected ? (
            <span className="truncate">
              {selected.name}
              <span className="text-muted-foreground font-mono text-xs">
                {" "}
                · {selected.customer?.meterNumber ?? "no meter"}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Search by name, email or meter…</span>
          )}
          <ChevronsUpDown className="text-muted-foreground" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-72 p-0" align="start">
        {/* The API does the matching, so cmdk's own filter is switched off. */}
        <Command shouldFilter={false}>
          <CommandInput value={term} onValueChange={setTerm} placeholder="Type to search…" />
          <CommandList>
            <CommandEmpty>
              {query.isPending ? "Searching…" : "No active customer matches."}
            </CommandEmpty>
            {customers.length > 0 ? (
              <CommandGroup className={cn(query.isPlaceholderData && "opacity-60")}>
                {customers.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => {
                      setChosen(user);
                      onChange(user.customer?.id ?? "");
                      setOpen(false);
                    }}
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">{user.name}</span>
                      <span className="text-muted-foreground truncate text-xs">
                        {user.customer?.meterNumber ?? "No meter number"} ·{" "}
                        {user.customer?.area?.name ?? "No area"}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto",
                        user.customer?.id === value ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
