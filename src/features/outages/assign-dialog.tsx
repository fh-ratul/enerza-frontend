"use client";

import { Shuffle, UserCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { adminQueries } from "@/features/admin/queries";
import { useResource } from "@/hooks/use-resource";
import { useRetained } from "@/hooks/use-retained";
import { cn } from "@/lib/utils";
import type { Outage } from "@/types/api";
import { useOutageStatus } from "./use-outage-status";

const AUTO = "auto";

function AssignForm({ outage, onDone }: { outage: Outage; onDone: () => void }) {
  const technicians = useResource(adminQueries.technicians);
  const assign = useOutageStatus({ onSuccess: onDone });
  const [choice, setChoice] = useState(AUTO);
  const zone = outage.feeder.substation.zone;
  const isReassignment = outage.technician !== null;

  // Only technicians of the outage's own zone can take it.
  const candidates = (technicians.data?.data ?? []).filter(
    (user) => user.technician?.zone.id === zone.id && user.status === "ACTIVE",
  );

  return (
    <div className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>{isReassignment ? "Reassign this outage" : "Assign a technician"}</DialogTitle>
        <DialogDescription>
          {outage.feeder.name}, {zone.name}.{" "}
          {isReassignment
            ? `Currently with ${outage.technician?.user.name}.`
            : "The technician is told by email."}
        </DialogDescription>
      </DialogHeader>

      <RadioGroup value={choice} onValueChange={setChoice} aria-label="Technician" className="gap-2.5">
        <label
          htmlFor="technician-auto"
          className={cn(
            "flex cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 transition-colors",
            choice === AUTO ? "border-foreground/40 bg-muted/60" : "hover:bg-muted/40",
          )}
        >
          <span className="bg-background grid size-9 shrink-0 place-items-center rounded-lg border">
            <Shuffle className="size-4" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-medium">Let the system choose</span>
            <span className="text-muted-foreground text-sm">
              The on-duty technician in {zone.name} with the fewest open jobs
            </span>
          </span>
          <RadioGroupItem id="technician-auto" value={AUTO} />
        </label>

        {technicians.isPending ? (
          <Skeleton className="h-16 rounded-xl" />
        ) : (
          candidates.map((user) => {
            const technician = user.technician;

            if (!technician) {
              return null;
            }

            const isFull = technician.activeJobCount >= technician.maxActiveJobs;
            const isCurrent = outage.technician?.id === technician.id;
            const unavailable = !technician.isAvailable || isFull || isCurrent;
            const id = `technician-${technician.id}`;

            return (
              <label
                key={technician.id}
                htmlFor={id}
                className={cn(
                  "flex items-center gap-3.5 rounded-xl border p-3.5 transition-colors",
                  unavailable ? "opacity-55" : "cursor-pointer",
                  choice === technician.id
                    ? "border-foreground/40 bg-muted/60"
                    : !unavailable && "hover:bg-muted/40",
                )}
              >
                <span className="bg-background grid size-9 shrink-0 place-items-center rounded-lg border">
                  <UserCheck className="size-4" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground nums text-sm">
                    {isCurrent
                      ? "Has this outage now"
                      : !technician.isAvailable
                        ? "Off duty"
                        : `${technician.activeJobCount} of ${technician.maxActiveJobs} open jobs${isFull ? " · at capacity" : ""}`}
                  </span>
                </span>
                <RadioGroupItem id={id} value={technician.id} disabled={unavailable} />
              </label>
            );
          })
        )}
      </RadioGroup>

      {!technicians.isPending && candidates.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No technician is attached to {zone.name} yet. Promote a customer to technician for this
          zone under Users.
        </p>
      ) : null}

      <DialogFooter>
        <Button variant="outline" size="lg" onClick={onDone} disabled={assign.isPending}>
          Cancel
        </Button>
        <Button
          size="lg"
          disabled={assign.isPending}
          onClick={() =>
            assign.mutate({
              id: outage.id,
              status: "ASSIGNED",
              ...(choice === AUTO ? {} : { technicianId: choice }),
            })
          }
        >
          {assign.isPending ? <Spinner /> : null}
          {isReassignment ? "Reassign" : "Assign"}
        </Button>
      </DialogFooter>
    </div>
  );
}

/** Dispatch: hand an outage to a technician, named or picked by the system. */
export function AssignDialog({ outage, onClose }: { outage: Outage | null; onClose: () => void }) {
  const shown = useRetained(outage);

  return (
    <Dialog open={outage !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        {shown ? <AssignForm key={shown.id} outage={shown} onDone={onClose} /> : null}
      </DialogContent>
    </Dialog>
  );
}
