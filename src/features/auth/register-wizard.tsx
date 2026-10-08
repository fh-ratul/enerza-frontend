"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, CircleAlert, UserPlus, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Controller, type FieldPath, useForm, useWatch } from "react-hook-form";
import { AreaCombobox } from "@/components/shared/area-combobox";
import { SelectField, TextField } from "@/components/shared/form-fields";
import { PasswordField } from "@/components/shared/password-field";
import { Stepper } from "@/components/shared/stepper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import type { AreaOption } from "@/features/grid/area-options";
import { applyFieldErrors } from "@/lib/action-result";
import { CONNECTION_TYPE } from "@/lib/status";
import { cn } from "@/lib/utils";
import { emptyRegisterDraft, useRegisterWizard } from "@/stores/register-wizard";
import { registerAction } from "./actions";
import { PASSWORD_RULES, type RegisterFormValues, registerFormSchema } from "./schemas";

type FieldName = FieldPath<RegisterFormValues>;

const STEPS: { title: string; description: string; fields: FieldName[] }[] = [
  {
    title: "Account",
    description: "Who you are",
    fields: ["name", "email", "password", "confirmPassword"],
  },
  {
    title: "Connection",
    description: "Your meter and area",
    fields: ["areaId", "meterNumber", "connectionType", "contactNumber"],
  },
  { title: "Review", description: "Check and confirm", fields: [] },
];

const ALL_FIELDS = STEPS.flatMap((step) => step.fields);
const LAST_STEP = STEPS.length - 1;

const defaultValues: RegisterFormValues = {
  ...emptyRegisterDraft,
  password: "",
  confirmPassword: "",
};

function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="grid gap-1.5 text-sm sm:grid-cols-2" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);

        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-2",
              passed ? "text-success" : "text-muted-foreground",
            )}
          >
            {passed ? (
              <Check className="size-3.5" aria-hidden />
            ) : (
              <X className="size-3.5" aria-hidden />
            )}
            {rule.label}
            <span className="sr-only">{passed ? " (met)" : " (not met yet)"}</span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Registration in three steps: account, connection, review. Each step is
 * validated before the next opens, and what has been typed (never the
 * password) survives a reload of the tab.
 */
export function RegisterWizard({ areas }: { areas: AreaOption[] }) {
  const queryClient = useQueryClient();
  const { step, draft, setStep, saveDraft, reset } = useRegisterWizard();
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues,
    mode: "onTouched",
  });
  const values = useWatch({ control: form.control });

  // Restore a draft saved earlier in this tab. The password is never stored,
  // so a restored draft always starts again at the first step.
  useEffect(() => {
    void Promise.resolve(useRegisterWizard.persist.rehydrate()).then(() => {
      const saved = useRegisterWizard.getState();

      form.reset({ ...defaultValues, ...saved.draft });
      saved.setStep(0);
    });
  }, [form]);

  const goNext = async () => {
    const isValid = await form.trigger(STEPS[step].fields, { shouldFocus: true });

    if (!isValid) {
      return;
    }

    const { name, email, contactNumber, areaId, meterNumber, connectionType } = form.getValues();

    saveDraft({ name, email, contactNumber, areaId, meterNumber, connectionType });
    setStep(Math.min(step + 1, LAST_STEP));
  };

  const onSubmit = form.handleSubmit((formValues) => {
    setFormError(null);

    startTransition(async () => {
      queryClient.clear();

      const result = await registerAction({
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
        contactNumber: formValues.contactNumber || undefined,
        areaId: formValues.areaId,
        meterNumber: formValues.meterNumber,
        connectionType: formValues.connectionType,
      });

      // A successful registration redirects and never gets here.
      if (result && !result.ok) {
        const hasFieldErrors = applyFieldErrors(result.fieldErrors, form.setError, ALL_FIELDS);
        const firstField = result.fieldErrors?.[0]?.path;
        const stepWithError = STEPS.findIndex((item) =>
          item.fields.includes(firstField as FieldName),
        );

        setFormError(hasFieldErrors ? null : result.message);

        if (stepWithError >= 0) {
          setStep(stepWithError);
        }

        return;
      }

      reset();
    });
  });

  const selectedArea = areas.find((area) => area.id === values.areaId);

  return (
    <form
      noValidate
      onSubmit={(event) => {
        // Enter on an earlier step moves forward instead of submitting.
        if (step < LAST_STEP) {
          event.preventDefault();
          void goNext();

          return;
        }

        void onSubmit(event);
      }}
      className="flex flex-col gap-8"
    >
      <Stepper steps={STEPS} current={step} />

      {formError ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden />
          <AlertTitle>Could not create your account</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      {step === 0 ? (
        <FieldGroup className="animate-in fade-in duration-300">
          <TextField
            control={form.control}
            name="name"
            label="Full name"
            autoComplete="name"
            placeholder="Nusrat Jahan"
          />
          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            description="Schedules, outage updates and receipts are sent here."
          />
          <PasswordField
            control={form.control}
            name="password"
            label="Password"
            autoComplete="new-password"
          />
          <PasswordChecklist password={values.password ?? ""} />
          <PasswordField
            control={form.control}
            name="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
          />
        </FieldGroup>
      ) : null}

      {step === 1 ? (
        <FieldGroup className="animate-in fade-in duration-300">
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
                />
                <FieldDescription id="areaId-description">
                  This links your account to the feeder that supplies you.
                </FieldDescription>
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              control={form.control}
              name="meterNumber"
              label="Meter number"
              placeholder="MTR-100245"
              autoCapitalize="characters"
              description="Printed on your meter and on a paper bill."
            />
            <SelectField
              control={form.control}
              name="connectionType"
              label="Connection type"
              options={[
                { value: "RESIDENTIAL", label: "Residential" },
                { value: "COMMERCIAL", label: "Commercial" },
              ]}
            />
          </div>
          <TextField
            control={form.control}
            name="contactNumber"
            label="Mobile number (optional)"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="01712345678"
          />
        </FieldGroup>
      ) : null}

      {step === LAST_STEP ? (
        <div className="animate-in fade-in flex flex-col gap-4 duration-300">
          <dl className="bg-muted/40 divide-y rounded-2xl border text-sm">
            {[
              { term: "Name", detail: values.name },
              { term: "Email", detail: values.email },
              {
                term: "Area",
                detail: selectedArea ? `${selectedArea.name}, ${selectedArea.zoneName}` : "—",
              },
              { term: "Supplied by", detail: selectedArea?.feederName ?? "—" },
              { term: "Meter number", detail: values.meterNumber?.toUpperCase() },
              {
                term: "Connection",
                detail: values.connectionType ? CONNECTION_TYPE[values.connectionType].label : "—",
              },
              { term: "Mobile number", detail: values.contactNumber || "Not provided" },
            ].map((row) => (
              <div key={row.term} className="flex items-baseline justify-between gap-6 px-4 py-3">
                <dt className="text-muted-foreground shrink-0">{row.term}</dt>
                <dd className="truncate text-right font-medium">{row.detail}</dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground text-sm">
            Your area can be changed later. Your meter number is fixed once your first bill is
            issued.
          </p>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="xl"
          onClick={() => setStep(Math.max(step - 1, 0))}
          disabled={step === 0 || isPending}
          className={cn(step === 0 && "invisible")}
        >
          <ArrowLeft data-icon="inline-start" />
          Back
        </Button>
        {step < LAST_STEP ? (
          <Button type="submit" size="xl">
            Continue
            <ArrowRight data-icon="inline-end" />
          </Button>
        ) : (
          <Button type="submit" size="xl" disabled={isPending}>
            {isPending ? <Spinner /> : <UserPlus data-icon="inline-start" />}
            {isPending ? "Creating account…" : "Create account"}
          </Button>
        )}
      </div>
    </form>
  );
}
