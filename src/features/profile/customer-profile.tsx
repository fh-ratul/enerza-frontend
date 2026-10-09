"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, ServerCrash } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { AreaCombobox } from "@/components/shared/area-combobox";
import { FeederPriorityBadge } from "@/components/shared/badges";
import { TextareaField, TextField } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { FormPageSkeleton } from "@/components/shared/page-skeletons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { AreaOption } from "@/features/grid/area-options";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAuth } from "@/hooks/use-auth";
import { applyFieldErrors } from "@/lib/action-result";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/resources";
import { formatNumber } from "@/lib/format";
import { CONNECTION_TYPE } from "@/lib/status";
import type { Me } from "@/types/api";
import { ProfileIdentity } from "./profile-identity";
import { type CustomerProfileValues, customerProfileSchema } from "./schemas";

const FIELDS = ["name", "contactNumber", "address", "areaId", "meterNumber"] as const;

const toValues = (user: Me): CustomerProfileValues => ({
  name: user.name,
  contactNumber: user.customer?.contactNumber ?? "",
  address: user.customer?.address ?? "",
  areaId: user.customer?.area?.id ?? "",
  meterNumber: user.customer?.meterNumber ?? "",
});

function ProfileForm({ user, areas }: { user: Me; areas: AreaOption[] }) {
  const form = useForm<CustomerProfileValues>({
    resolver: zodResolver(customerProfileSchema),
    // Follows the profile: after a save the form restarts from what was stored.
    values: toValues(user),
    mode: "onTouched",
  });
  const { dirtyFields, isDirty } = form.formState;

  const save = useApiMutation<Me, Partial<Record<(typeof FIELDS)[number], string | null>>>({
    mutationFn: (body) => api.patch<Me>("/users/me", body),
    // A new area means a new feeder: its schedule and outages are different ones.
    invalidate: [queryKeys.me, queryKeys.schedules, queryKeys.outages],
    onError: (error) => applyFieldErrors(error.fieldErrors, form.setError, FIELDS),
  });

  const onSubmit = form.handleSubmit((values) => {
    // Only what was changed is sent; an emptied optional field is cleared with null.
    save.mutate({
      ...(dirtyFields.name ? { name: values.name } : {}),
      ...(dirtyFields.contactNumber ? { contactNumber: values.contactNumber || null } : {}),
      ...(dirtyFields.address ? { address: values.address || null } : {}),
      ...(dirtyFields.areaId ? { areaId: values.areaId } : {}),
      ...(dirtyFields.meterNumber ? { meterNumber: values.meterNumber } : {}),
    });
  });

  const customer = user.customer;
  const feeder = customer?.area?.feeder;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="bg-card flex flex-col gap-8 rounded-2xl border p-6"
    >
      <section className="flex flex-col gap-5" aria-labelledby="details-heading">
        <h2 id="details-heading" className="font-sans text-base font-semibold tracking-normal">
          Personal details
        </h2>
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField control={form.control} name="name" label="Full name" autoComplete="name" />
            <TextField
              control={form.control}
              name="contactNumber"
              label="Mobile number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="01712345678"
              description="Optional. The crew may call it about a repair."
            />
          </div>
          <TextareaField
            control={form.control}
            name="address"
            label="Address"
            rows={2}
            maxLength={200}
            placeholder="House, road and neighbourhood"
            description="Optional. Helps a technician find the fault."
          />
        </FieldGroup>
      </section>

      <section className="flex flex-col gap-5 border-t pt-8" aria-labelledby="connection-heading">
        <h2 id="connection-heading" className="font-sans text-base font-semibold tracking-normal">
          Connection
        </h2>
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="areaId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="areaId">Your area</FieldLabel>
                  <AreaCombobox
                    id="areaId"
                    areas={areas}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    invalid={fieldState.invalid}
                    describedBy="areaId-description"
                    disabled={areas.length === 0}
                  />
                  <FieldDescription id="areaId-description">
                    Decides which feeder&apos;s schedule you see. It cannot be changed while you
                    have an open outage report.
                  </FieldDescription>
                  {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                </Field>
              )}
            />
            <TextField
              control={form.control}
              name="meterNumber"
              label="Meter number"
              placeholder="MTR-100245"
              autoCapitalize="characters"
              description="Printed on your meter. Fixed once your first bill has been issued."
            />
          </div>
        </FieldGroup>

        {customer ? (
          <dl className="bg-muted/40 grid gap-x-6 gap-y-4 rounded-xl border p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Connection type</dt>
              <dd className="font-medium">{CONNECTION_TYPE[customer.connectionType].label}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Sanctioned load</dt>
              <dd className="nums font-medium">{Number(customer.sanctionedLoadKW)} kW</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Last meter reading</dt>
              <dd className="nums font-medium">{formatNumber(customer.lastReading)} kWh</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-xs">Feeder</dt>
              <dd className="flex flex-wrap items-center gap-2 font-medium">
                {feeder ? (
                  <>
                    {feeder.name}
                    <FeederPriorityBadge priority={feeder.priority} />
                  </>
                ) : (
                  "Not linked yet"
                )}
              </dd>
            </div>
          </dl>
        ) : null}
      </section>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => form.reset()}
          disabled={!isDirty || save.isPending}
        >
          Discard changes
        </Button>
        <Button type="submit" size="lg" disabled={!isDirty || save.isPending}>
          {save.isPending ? <Spinner /> : <Save data-icon="inline-start" />}
          {save.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

/** The customer's own profile: identity and photo on one side, the editable details on the other. */
export function CustomerProfile({ areas }: { areas: AreaOption[] }) {
  const { user } = useAuth();

  if (!user) {
    return <FormPageSkeleton />;
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your contact details and the connection your account is linked to."
      />

      {user.customer && !user.customer.isProfileComplete ? (
        <Alert>
          <AlertTitle>One more step</AlertTitle>
          <AlertDescription>
            Add your area and meter number below. Without them we cannot tell which feeder supplies
            you, so there is no schedule to show and no outage to report against.
          </AlertDescription>
        </Alert>
      ) : null}

      {areas.length === 0 ? (
        <Alert variant="destructive">
          <ServerCrash aria-hidden />
          <AlertTitle>The list of areas could not be loaded</AlertTitle>
          <AlertDescription>
            You can still change your other details. Reload the page to choose a different area.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[20rem_1fr]">
        <ProfileIdentity user={user} />
        <ProfileForm user={user} areas={areas} />
      </div>
    </>
  );
}
