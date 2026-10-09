"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SelectField, TextareaField } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { applyFieldErrors } from "@/lib/action-result";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/resources";
import type { Feeder, ReportOutageResult } from "@/types/api";
import { type CreateIncidentValues, createIncidentSchema } from "./schemas";

function IncidentForm({ feeders, onDone }: { feeders: Feeder[]; onDone: () => void }) {
  const form = useForm<CreateIncidentValues>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: { feederId: "", description: "" },
  });

  const create = useApiMutation<ReportOutageResult, CreateIncidentValues>({
    mutationFn: (values) => api.post<ReportOutageResult>("/outages", values),
    invalidate: [queryKeys.outages, queryKeys.adminStats],
    onSuccess: onDone,
    onError: (error) =>
      applyFieldErrors(error.fieldErrors, form.setError, ["feederId", "description"]),
  });

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) => create.mutate(values))}
      className="flex flex-col gap-5"
    >
      <DialogHeader>
        <DialogTitle>Log an incident</DialogTitle>
        <DialogDescription>
          For a fault the control room knows about before any customer reports it. A feeder has at
          most one open outage, so later reports are added to this one.
        </DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <SelectField
          control={form.control}
          name="feederId"
          label="Feeder"
          placeholder="Choose the feeder that is out"
          options={feeders.map((feeder) => ({
            value: feeder.id,
            label: `${feeder.name} · ${feeder.substation.zone.name}`,
          }))}
        />
        <TextareaField
          control={form.control}
          name="description"
          label="What happened?"
          placeholder="e.g. SCADA shows the breaker tripped on overcurrent at 14:05."
          rows={4}
          maxLength={500}
        />
      </FieldGroup>
      <DialogFooter>
        <Button type="button" variant="outline" size="lg" onClick={onDone} disabled={create.isPending}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={create.isPending}>
          {create.isPending ? <Spinner /> : null}
          Log incident
        </Button>
      </DialogFooter>
    </form>
  );
}

type IncidentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeders: Feeder[];
};

/** The control room opens an outage itself, against a feeder it names. */
export function IncidentDialog({ open, onOpenChange, feeders }: IncidentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <IncidentForm feeders={feeders} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
