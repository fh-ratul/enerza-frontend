"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { SelectField, TextareaField, TextField } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { applyFieldErrors } from "@/lib/action-result";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/resources";
import { SCHEDULE_TYPE } from "@/lib/status";
import type { Feeder, Schedule } from "@/types/api";
import { FeederMultiSelect } from "./feeder-multi-select";
import { MAX_FEEDERS_PER_SCHEDULE, type ScheduleFormValues, scheduleFormSchema } from "./schemas";

const FIELDS = ["type", "feederIds", "startTime", "endTime", "reason"] as const;

const typeOptions = [
  { value: "LOAD_SHEDDING", label: `${SCHEDULE_TYPE.LOAD_SHEDDING.label} · up to 4 hours` },
  { value: "MAINTENANCE", label: `${SCHEDULE_TYPE.MAINTENANCE.label} · up to 12 hours` },
];

function ScheduleForm({ feeders, onDone }: { feeders: Feeder[]; onDone: () => void }) {
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: { type: "LOAD_SHEDDING", feederIds: [], startTime: "", endTime: "", reason: "" },
    mode: "onTouched",
  });
  const type = useWatch({ control: form.control, name: "type" });

  const create = useApiMutation<Schedule[], ScheduleFormValues>({
    mutationFn: ({ reason, ...values }) =>
      api.post<Schedule[]>("/schedules", { ...values, ...(reason ? { reason } : {}) }),
    invalidate: [queryKeys.schedules],
    successMessage: ({ data }) =>
      `${data.length} draft ${data.length === 1 ? "schedule" : "schedules"} created. Publish to notify customers.`,
    onSuccess: onDone,
    onError: (error) => applyFieldErrors(error.fieldErrors, form.setError, FIELDS),
  });

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) => create.mutate(values))}
      className="flex flex-col gap-6"
    >
      <DialogHeader>
        <DialogTitle>New schedule</DialogTitle>
        <DialogDescription>
          The same window is created on every feeder you choose, as a draft. Customers only see it
          once you publish it.
        </DialogDescription>
      </DialogHeader>

      <FieldGroup>
        <SelectField control={form.control} name="type" label="Type" options={typeOptions} />
        <Controller
          control={form.control}
          name="feederIds"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="feederIds">Feeders</FieldLabel>
              <FeederMultiSelect
                id="feederIds"
                feeders={feeders}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                max={MAX_FEEDERS_PER_SCHEDULE}
                invalid={fieldState.invalid}
                disabledReason={(feeder) =>
                  type === "LOAD_SHEDDING" && feeder.priority === "CRITICAL"
                    ? "Critical feeders are never load-shed"
                    : null
                }
              />
              <FieldDescription>
                A feeder cannot have two schedules that overlap, and gets at most 4 hours of load
                shedding a day.
              </FieldDescription>
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="startTime"
            label="Starts (Dhaka time)"
            type="datetime-local"
            step={300}
          />
          <TextField
            control={form.control}
            name="endTime"
            label="Ends (Dhaka time)"
            type="datetime-local"
            step={300}
          />
        </div>
        <TextareaField
          control={form.control}
          name="reason"
          label="Reason (optional)"
          placeholder="e.g. Generation shortfall at the Ghorashal plant"
          rows={2}
          maxLength={300}
          description="Shown to customers with the schedule."
        />
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="outline" size="lg" onClick={onDone} disabled={create.isPending}>
          Cancel
        </Button>
        <Button type="submit" size="lg" disabled={create.isPending}>
          {create.isPending ? <Spinner /> : null}
          Create drafts
        </Button>
      </DialogFooter>
    </form>
  );
}

type ScheduleFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeders: Feeder[];
};

export function ScheduleFormDialog({ open, onOpenChange, feeders }: ScheduleFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        {/* Unmounted with the dialog, so every opening starts from an empty form. */}
        <ScheduleForm
          feeders={feeders.filter((feeder) => feeder.isActive)}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
