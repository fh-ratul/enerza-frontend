"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { FormPageSkeleton } from "@/components/shared/page-skeletons";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useDuty } from "@/features/technician/use-duty";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAuth } from "@/hooks/use-auth";
import { applyFieldErrors } from "@/lib/action-result";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/resources";
import { formatDateTime } from "@/lib/format";
import type { Me } from "@/types/api";
import { ProfileIdentity } from "./profile-identity";
import { type TechnicianProfileValues, technicianProfileSchema } from "./schemas";

const FIELDS = ["name", "contactNumber"] as const;

function ProfileForm({ user }: { user: Me }) {
  const form = useForm<TechnicianProfileValues>({
    resolver: zodResolver(technicianProfileSchema),
    values: { name: user.name, contactNumber: user.technician?.contactNumber ?? "" },
    mode: "onTouched",
  });
  const { dirtyFields, isDirty } = form.formState;

  const save = useApiMutation<Me, { name?: string; contactNumber?: string | null }>({
    mutationFn: (body) => api.patch<Me>("/users/me", body),
    invalidate: [queryKeys.me],
    onError: (error) => applyFieldErrors(error.fieldErrors, form.setError, FIELDS),
  });

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) =>
        save.mutate({
          ...(dirtyFields.name ? { name: values.name } : {}),
          ...(dirtyFields.contactNumber ? { contactNumber: values.contactNumber || null } : {}),
        }),
      )}
      className="bg-card flex flex-col gap-6 rounded-2xl border p-6"
    >
      <h2 className="font-sans text-base font-semibold tracking-normal">Contact details</h2>
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
            description="Shown to customers whose outage you are repairing."
          />
        </div>
      </FieldGroup>
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

/** The technician's own profile, and whether they are taking jobs. */
export function TechnicianProfile() {
  const { user } = useAuth();
  const duty = useDuty();
  const technician = user?.technician;

  if (!user || !technician) {
    return <FormPageSkeleton />;
  }

  return (
    <>
      <PageHeader
        title="Profile & availability"
        description="Your contact details, and whether the control room can assign you new outages."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[20rem_1fr]">
        <ProfileIdentity user={user} />

        <div className="flex flex-col gap-6">
          <section
            aria-labelledby="duty-heading"
            className="bg-card flex flex-col gap-5 rounded-2xl border p-6"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex flex-col gap-1">
                <h2 id="duty-heading" className="font-sans text-base font-semibold tracking-normal">
                  {technician.isAvailable ? "You are on duty" : "You are off duty"}
                </h2>
                <p className="text-muted-foreground text-sm text-pretty">
                  While you are on duty, new outages in your zone can be assigned to you, up to your
                  limit of open jobs. Going off duty does not affect the jobs you already have.
                </p>
              </div>
              <Switch
                checked={technician.isAvailable}
                onCheckedChange={(checked) => duty.mutate(checked)}
                disabled={duty.isPending}
                aria-labelledby="duty-heading"
              />
            </div>
            <dl className="bg-muted/40 grid gap-x-6 gap-y-4 rounded-xl border p-4 text-sm sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs">Zone</dt>
                <dd className="font-medium">{technician.zone.name}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs">Open jobs</dt>
                <dd className="nums font-medium">
                  {technician.activeJobCount} of {technician.maxActiveJobs}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-xs">Last assigned</dt>
                <dd className="nums font-medium">
                  {technician.lastAssignedAt ? formatDateTime(technician.lastAssignedAt) : "Never"}
                </dd>
              </div>
            </dl>
          </section>

          <ProfileForm user={user} />
        </div>
      </div>
    </>
  );
}
