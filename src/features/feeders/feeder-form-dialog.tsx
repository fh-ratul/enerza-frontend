"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { SelectField, SwitchField, TextField } from "@/components/shared/form-fields";
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
import type { GridSubstation } from "@/features/admin/use-grid";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRetained } from "@/hooks/use-retained";
import { applyFieldErrors } from "@/lib/action-result";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/resources";
import { FEEDER_PRIORITY } from "@/lib/status";
import type { Feeder, FeederPriority } from "@/types/api";
import { type FeederFormValues, feederFormSchema, MAX_AREAS_PER_REQUEST } from "./schemas";

const FIELDS = ["name", "code", "loadMW", "priority", "isActive", "substationId", "areas"] as const;

const priorityOptions = (Object.keys(FEEDER_PRIORITY) as FeederPriority[]).map((value) => ({
  value,
  label: `${FEEDER_PRIORITY[value].label} · ${FEEDER_PRIORITY[value].description}`,
}));

const emptyValues: FeederFormValues = {
  name: "",
  code: "",
  // The box starts empty; the schema asks for a number before anything is sent.
  loadMW: undefined as unknown as number,
  priority: "NORMAL",
  isActive: true,
  substationId: "",
  areas: [],
};

const toValues = (feeder: Feeder): FeederFormValues => ({
  name: feeder.name,
  code: feeder.code,
  loadMW: Number(feeder.loadMW),
  priority: feeder.priority,
  isActive: feeder.isActive,
  substationId: feeder.substation.id,
  areas: [],
});

type FeederFormProps = {
  /** The feeder being edited; without one the form creates a feeder. */
  feeder: Feeder | null;
  substations: GridSubstation[];
  onDone: () => void;
};

function FeederForm({ feeder, substations, onDone }: FeederFormProps) {
  const isEditing = feeder !== null;
  const form = useForm<FeederFormValues>({
    resolver: zodResolver(feederFormSchema),
    defaultValues: feeder ? toValues(feeder) : emptyValues,
    mode: "onTouched",
  });
  const areas = useFieldArray({ control: form.control, name: "areas" });
  const { dirtyFields } = form.formState;

  const save = useApiMutation<Feeder, FeederFormValues>({
    mutationFn: (values) => {
      if (!feeder) {
        return api.post<Feeder>("/feeders", values);
      }

      // A feeder's code and substation are fixed; only what changed is sent,
      // and new areas are added to the ones it already has.
      return api.patch<Feeder>(`/feeders/${feeder.id}`, {
        ...(dirtyFields.name ? { name: values.name } : {}),
        ...(dirtyFields.loadMW ? { loadMW: values.loadMW } : {}),
        ...(dirtyFields.priority ? { priority: values.priority } : {}),
        ...(dirtyFields.isActive ? { isActive: values.isActive } : {}),
        ...(values.areas.length > 0 ? { areas: values.areas } : {}),
      });
    },
    invalidate: [queryKeys.feeders, queryKeys.adminStats],
    onSuccess: onDone,
    onError: (error) => applyFieldErrors(error.fieldErrors, form.setError, FIELDS),
  });

  const substationOptions = substations.map((substation) => ({
    value: substation.id,
    label: `${substation.name} · ${substation.zone.name}`,
  }));

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) => save.mutate(values))}
      className="flex flex-col gap-6"
    >
      <DialogHeader>
        <DialogTitle>{isEditing ? `Edit ${feeder.name}` : "Add a feeder"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "The code and the substation identify where a feeder sits on the grid and cannot be changed."
            : "A feeder supplies one or more areas. Customers are linked to it through the area they live in."}
        </DialogDescription>
      </DialogHeader>

      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            control={form.control}
            name="name"
            label="Name"
            placeholder="Mirpur-10 Feeder"
          />
          <TextField
            control={form.control}
            name="code"
            label="Code"
            placeholder="FD-MIR-01"
            autoCapitalize="characters"
            disabled={isEditing}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            control={form.control}
            name="substationId"
            label="Substation"
            placeholder="Choose a substation"
            options={substationOptions}
            disabled={isEditing}
          />
          <TextField
            control={form.control}
            name="loadMW"
            label="Connected load (MW)"
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0}
            placeholder="8.5"
          />
        </div>
        <SelectField
          control={form.control}
          name="priority"
          label="Priority"
          options={priorityOptions}
          description="Decides how early in a rotation the feeder is shed. Critical feeders are never shed."
        />
        <SwitchField
          control={form.control}
          name="isActive"
          label="In service"
          description="A feeder that is out of service is left out of generated rotations."
        />
      </FieldGroup>

      <section className="flex flex-col gap-4 border-t pt-5" aria-labelledby="areas-heading">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h3 id="areas-heading" className="font-sans text-sm font-semibold tracking-normal">
              {isEditing ? "Add areas" : "Areas supplied"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {isEditing && feeder.areas.length > 0
                ? `Already supplies ${feeder.areas.map((area) => area.name).join(", ")}.`
                : "The neighbourhoods customers choose from when they register."}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => areas.append({ name: "", code: "" })}
            disabled={areas.fields.length >= MAX_AREAS_PER_REQUEST}
          >
            <Plus data-icon="inline-start" />
            Add area
          </Button>
        </div>

        {areas.fields.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {areas.fields.map((field, index) => (
              <li key={field.id} className="grid items-start gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <TextField
                  control={form.control}
                  name={`areas.${index}.name`}
                  label={`Area ${index + 1} name`}
                  placeholder="Pallabi"
                />
                <TextField
                  control={form.control}
                  name={`areas.${index}.code`}
                  label="Code"
                  placeholder="AR-PALLABI"
                  autoCapitalize="characters"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  className="sm:mt-6.5"
                  onClick={() => areas.remove(index)}
                  aria-label={`Remove area ${index + 1}`}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <DialogFooter>
        <Button type="button" variant="outline" size="lg" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={save.isPending || (isEditing && !form.formState.isDirty)}
        >
          {save.isPending ? <Spinner /> : null}
          {isEditing ? "Save changes" : "Add feeder"}
        </Button>
      </DialogFooter>
    </form>
  );
}

type FeederFormDialogProps = {
  /** "new" creates a feeder; a feeder edits it; null keeps the dialog shut. */
  target: Feeder | "new" | null;
  substations: GridSubstation[];
  onClose: () => void;
};

export function FeederFormDialog({ target, substations, onClose }: FeederFormDialogProps) {
  const shown = useRetained(target);

  return (
    <Dialog open={target !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        {shown ? (
          // A fresh form for each feeder: the key throws away the previous one's state.
          <FeederForm
            key={shown === "new" ? "new" : shown.id}
            feeder={shown === "new" ? null : shown}
            substations={substations}
            onDone={onClose}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
