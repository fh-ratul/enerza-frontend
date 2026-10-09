"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CircleAlert,
  CircleCheck,
  Save,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { type FieldPath, useForm, useWatch } from "react-hook-form";
import { SimpleBarChart } from "@/components/charts/bar-chart";
import { ChartCard } from "@/components/charts/chart-card";
import { FeederPriorityBadge } from "@/components/shared/badges";
import { SelectField, TextField } from "@/components/shared/form-fields";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Stepper } from "@/components/shared/stepper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useGrid } from "@/features/admin/use-grid";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useNow } from "@/hooks/use-now";
import { applyFieldErrors } from "@/lib/action-result";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/resources";
import { formatDate, formatDuration, formatMW, formatTimeRange, toDhakaDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GeneratorPlan } from "@/types/api";
import {
  type GeneratorFormValues,
  generatorFormSchema,
  SLOT_MINUTES,
  toGeneratorRequest,
} from "./schemas";

type FieldName = FieldPath<GeneratorFormValues>;

const STEPS: { title: string; description: string; fields: FieldName[] }[] = [
  { title: "Scope", description: "Where to shed", fields: ["scopeType", "scopeId"] },
  {
    title: "Shortfall",
    description: "When and how much",
    fields: ["date", "startHour", "endHour", "slotMinutes", "deficitMW"],
  },
  { title: "Review", description: "Check the plan", fields: [] },
];

const FIELDS = ["scopeId", "date", "startHour", "endHour", "slotMinutes", "deficitMW"] as const;

const hourLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00`;
const startHourOptions = Array.from({ length: 24 }, (_, hour) => ({
  value: String(hour),
  label: hourLabel(hour),
}));
const endHourOptions = Array.from({ length: 24 }, (_, index) => ({
  value: String(index + 1),
  label: hourLabel(index + 1),
}));
const slotOptions = SLOT_MINUTES.map((minutes) => ({
  value: String(minutes),
  label: `${minutes} minutes`,
}));

function PlanPreview({ plan }: { plan: GeneratorPlan }) {
  const { summary } = plan;
  const isShort = summary.totalUnmetMW > 0;
  const fairness = summary.feeders.map((feeder) => ({
    feeder: feeder.code,
    planned: feeder.plannedMinutes,
    recent: feeder.shedMinutesLast7Days,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Slots covered"
          icon={CalendarCheck}
          tone={summary.fullyCoveredSlots === summary.totalSlots ? "success" : "warning"}
          value={`${summary.fullyCoveredSlots} of ${summary.totalSlots}`}
          hint={`${plan.slotMinutes}-minute slots on ${formatDate(`${plan.date}T06:00:00Z`)}`}
        />
        <StatCard
          label="Shed in every slot"
          icon={Sparkles}
          tone="brand"
          value={formatMW(plan.deficitMW)}
          hint={`Across ${plan.scope.name}`}
        />
        <StatCard
          label="Shortfall not covered"
          icon={CircleAlert}
          tone={isShort ? "danger" : "success"}
          value={formatMW(summary.totalUnmetMW)}
          hint={isShort ? "Added up over all slots" : "The plan sheds the full shortfall"}
        />
      </div>

      {isShort ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden />
          <AlertTitle>This plan cannot shed the whole shortfall</AlertTitle>
          <AlertDescription>
            There is not enough sheddable load in {plan.scope.name}, or feeders have reached their
            four hours for the day. Critical feeders are never shed. You can still save what is
            planned, or go back and widen the scope.
          </AlertDescription>
        </Alert>
      ) : null}

      <section aria-labelledby="slots-heading" className="flex flex-col gap-3">
        <h3 id="slots-heading" className="font-sans text-base font-semibold tracking-normal">
          Rotation
        </h3>
        <div className="bg-card overflow-x-auto rounded-2xl border">
          <table className="w-full text-sm">
            <caption className="sr-only">Feeders shed in each slot</caption>
            <thead className="bg-muted/50">
              <tr className="text-muted-foreground text-left text-xs">
                <th scope="col" className="px-4 py-3 font-medium">
                  Slot
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Feeders shed
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Shed
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Uncovered
                </th>
              </tr>
            </thead>
            <tbody>
              {plan.slots.map((slot) => (
                <tr key={slot.startTime} className="border-t align-top">
                  <th scope="row" className="nums px-4 py-3 text-left font-medium whitespace-nowrap">
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </th>
                  <td className="px-4 py-3">
                    {slot.feeders.length === 0 ? (
                      <span className="text-muted-foreground">No feeder available</span>
                    ) : (
                      <ul className="flex flex-wrap gap-1.5">
                        {slot.feeders.map((feeder) => (
                          <li
                            key={feeder.id}
                            title={`${feeder.name} · ${formatMW(feeder.loadMW)}`}
                            className="bg-muted rounded-full px-2.5 py-1 font-mono text-xs"
                          >
                            {feeder.code}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="nums px-4 py-3 text-right whitespace-nowrap">
                    {formatMW(slot.shedMW)}
                  </td>
                  <td
                    className={cn(
                      "nums px-4 py-3 text-right whitespace-nowrap",
                      slot.unmetMW > 0 ? "font-medium" : "text-muted-foreground",
                    )}
                  >
                    {slot.unmetMW > 0 ? formatMW(slot.unmetMW) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ChartCard
        title="How the cut is shared"
        description="Minutes each feeder is shed in this plan, next to what it already had in the last 7 days"
        isEmpty={fairness.length === 0}
        emptyMessage="No feeder in this scope can be shed."
        table={{
          columns: [
            { header: "Feeder" },
            { header: "Priority" },
            { header: "Load", align: "right" },
            { header: "Last 7 days", align: "right" },
            { header: "This plan", align: "right" },
          ],
          rows: summary.feeders.map((feeder) => [
            feeder.code,
            feeder.priority,
            formatMW(feeder.loadMW),
            formatDuration(feeder.shedMinutesLast7Days),
            formatDuration(feeder.plannedMinutes),
          ]),
        }}
      >
        <SimpleBarChart
          data={fairness}
          categoryKey="feeder"
          series={[
            { key: "planned", label: "This plan" },
            { key: "recent", label: "Last 7 days" },
          ]}
          orientation="horizontal"
          categoryWidth={92}
          formatValue={(value) => formatDuration(value)}
          formatTick={(value) => `${value} min`}
        />
      </ChartCard>
    </div>
  );
}

/**
 * Plans a fair load-shedding rotation for a supply shortfall, in three steps:
 * where, when and how much, then a dry run to review before anything is saved.
 */
export function GenerateWizard() {
  const grid = useGrid();
  const now = useNow();
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<GeneratorPlan | null>(null);
  const [saved, setSaved] = useState<GeneratorPlan | null>(null);
  const form = useForm<GeneratorFormValues>({
    resolver: zodResolver(generatorFormSchema),
    defaultValues: {
      scopeType: "ZONE",
      scopeId: "",
      date: "",
      startHour: "18",
      endHour: "22",
      slotMinutes: "60",
      deficitMW: undefined as unknown as number,
    },
    mode: "onTouched",
  });
  const scopeType = useWatch({ control: form.control, name: "scopeType" });
  const scopeId = useWatch({ control: form.control, name: "scopeId" });

  const showErrors = (fieldErrors: Parameters<typeof applyFieldErrors>[0]) => {
    // The API names the scope field by what was sent; the form has one box for both.
    const mapped = fieldErrors?.map((error) =>
      error.path === "zoneId" || error.path === "substationId" ? { ...error, path: "scopeId" } : error,
    );
    const applied = applyFieldErrors(mapped, form.setError, FIELDS);

    if (applied) {
      setStep(mapped?.some((error) => error.path === "scopeId") ? 0 : 1);
    }

    return applied;
  };

  const preview = useApiMutation<GeneratorPlan, GeneratorFormValues>({
    mutationFn: (values) => api.post<GeneratorPlan>("/schedules/generate", toGeneratorRequest(values, true)),
    successMessage: false,
    onSuccess: ({ data }) => {
      setPlan(data);
      setStep(2);
    },
    onError: (error) => showErrors(error.fieldErrors),
  });

  const save = useApiMutation<GeneratorPlan, GeneratorFormValues>({
    mutationFn: (values) => api.post<GeneratorPlan>("/schedules/generate", toGeneratorRequest(values, false)),
    invalidate: [queryKeys.schedules],
    successMessage: ({ data }) =>
      `${data.schedulesCreated} draft ${data.schedulesCreated === 1 ? "schedule" : "schedules"} saved`,
    onSuccess: ({ data }) => setSaved(data),
    onError: (error) => showErrors(error.fieldErrors),
  });

  const scopeOptions =
    scopeType === "ZONE"
      ? grid.zoneOptions
      : grid.substations.map((substation) => ({
          value: substation.id,
          label: `${substation.name} · ${substation.zone.name}`,
        }));

  const inScope = grid.feeders.filter((feeder) =>
    scopeType === "ZONE" ? feeder.substation.zone.id === scopeId : feeder.substation.id === scopeId,
  );
  const sheddable = inScope.filter((feeder) => feeder.isActive && feeder.priority !== "CRITICAL");
  const sheddableMW =
    sheddable.reduce((total, feeder) => total + Math.round(Number(feeder.loadMW) * 100), 0) / 100;

  const goNext = async () => {
    if (step === 0) {
      if (await form.trigger(STEPS[0].fields, { shouldFocus: true })) {
        setStep(1);
      }

      return;
    }

    // The whole form is checked here, cross-field rules included, then dry-run by the API.
    await form.handleSubmit((values) => preview.mutate(values))();
  };

  const restart = () => {
    form.reset();
    setPlan(null);
    setSaved(null);
    setStep(0);
  };

  if (saved) {
    return (
      <>
        <PageHeader title="Generate rotation" />
        <div className="bg-card flex flex-col items-center gap-5 rounded-3xl border px-6 py-12 text-center">
          <span className="bg-success/12 text-success grid size-16 place-items-center rounded-full">
            <CircleCheck className="size-8" aria-hidden />
          </span>
          <div className="flex max-w-md flex-col gap-2">
            <h2 className="text-2xl font-semibold">
              {saved.schedulesCreated} draft {saved.schedulesCreated === 1 ? "schedule" : "schedules"}{" "}
              saved
            </h2>
            <p className="text-muted-foreground text-pretty">
              The rotation for {saved.scope.name} on {formatDate(`${saved.date}T06:00:00Z`)} is saved
              as drafts. Nothing has been sent to customers: publish each schedule when you are
              ready.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/admin/schedules?status=DRAFT">
                Review and publish
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={restart}>
              Plan another
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Generate rotation"
        description="Tell the generator how much load has to come off and when. It spreads the cut across feeders: lowest priority first, the least-shed feeder first, never a critical feeder, never more than four hours a day."
      />

      <Stepper steps={STEPS} current={step} className="max-w-2xl" />

      <form
        noValidate
        onSubmit={(event) => event.preventDefault()}
        className={cn("flex flex-col gap-6", step < 2 && "bg-card rounded-2xl border p-6")}
      >
        {step === 0 ? (
          <FieldGroup className="max-w-xl">
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 text-sm font-medium">Shed load across</legend>
              <RadioGroup
                value={scopeType}
                onValueChange={(value) => {
                  form.setValue("scopeType", value as "ZONE" | "SUBSTATION");
                  form.setValue("scopeId", "");
                }}
                className="grid gap-3 sm:grid-cols-2"
              >
                {(
                  [
                    { value: "ZONE", title: "A whole zone", body: "Every feeder in the zone takes part." },
                    {
                      value: "SUBSTATION",
                      title: "One substation",
                      body: "Only the feeders under it take part.",
                    },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.value}
                    htmlFor={`scope-${option.value}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                      scopeType === option.value ? "border-foreground/40 bg-muted/60" : "hover:bg-muted/40",
                    )}
                  >
                    <RadioGroupItem id={`scope-${option.value}`} value={option.value} className="mt-0.5" />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium">{option.title}</span>
                      <span className="text-muted-foreground text-sm">{option.body}</span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </fieldset>

            {grid.isLoading ? (
              <Skeleton className="h-16" />
            ) : (
              <SelectField
                control={form.control}
                name="scopeId"
                label={scopeType === "ZONE" ? "Zone" : "Substation"}
                placeholder={scopeType === "ZONE" ? "Choose a zone" : "Choose a substation"}
                options={scopeOptions}
              />
            )}

            {scopeId && inScope.length > 0 ? (
              <div className="bg-muted/40 flex flex-col gap-3 rounded-xl border p-4">
                <p className="text-sm">
                  <span className="font-medium">
                    {sheddable.length} of {inScope.length} feeders
                  </span>{" "}
                  can be shed, {formatMW(sheddableMW)} in total. Critical and out-of-service feeders
                  are left alone.
                </p>
                <ul className="flex flex-wrap gap-2">
                  {inScope.map((feeder) => (
                    <li key={feeder.id} className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">{feeder.code}</span>
                      <FeederPriorityBadge priority={feeder.priority} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </FieldGroup>
        ) : null}

        {step === 1 ? (
          <FieldGroup className="max-w-xl">
            <TextField
              control={form.control}
              name="date"
              label="Day (Dhaka time)"
              type="date"
              min={now ? toDhakaDay(now) : undefined}
            />
            <div className="grid gap-5 sm:grid-cols-3">
              <SelectField
                control={form.control}
                name="startHour"
                label="From"
                options={startHourOptions}
              />
              <SelectField control={form.control} name="endHour" label="Until" options={endHourOptions} />
              <SelectField
                control={form.control}
                name="slotMinutes"
                label="Slot length"
                options={slotOptions}
              />
            </div>
            <TextField
              control={form.control}
              name="deficitMW"
              label="Shortfall to shed in every slot (MW)"
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              placeholder="12"
              description={
                scopeId
                  ? `Up to ${formatMW(sheddableMW)} can be shed in this scope at any one time.`
                  : undefined
              }
            />
          </FieldGroup>
        ) : null}

        {step === 2 && plan ? <PlanPreview plan={plan} /> : null}

        <div
          className={cn(
            "flex flex-col-reverse gap-3 sm:flex-row sm:justify-between",
            step < 2 && "border-t pt-6",
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setStep(step - 1)}
            disabled={step === 0 || preview.isPending || save.isPending}
          >
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>
          {step < 2 ? (
            <Button type="button" size="lg" onClick={goNext} disabled={preview.isPending}>
              {preview.isPending ? <Spinner /> : null}
              {step === 0 ? "Continue" : preview.isPending ? "Planning…" : "Preview the plan"}
              {preview.isPending ? null : <ArrowRight data-icon="inline-end" />}
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              disabled={save.isPending || !plan || plan.slots.every((slot) => slot.feeders.length === 0)}
              onClick={() => form.handleSubmit((values) => save.mutate(values))()}
            >
              {save.isPending ? <Spinner /> : <Save data-icon="inline-start" />}
              {save.isPending ? "Saving…" : "Save as drafts"}
            </Button>
          )}
        </div>
      </form>
    </>
  );
}
