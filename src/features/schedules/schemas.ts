import { z } from "zod";
import { megawattsSchema } from "@/features/feeders/schemas";

// The API's rules for schedules (its schedule.validation.ts). Times typed
// into a form are Dhaka time, whatever the admin's own time zone is.

export const MIN_SCHEDULE_MINUTES = 30;
export const MAX_LOAD_SHEDDING_MINUTES = 4 * 60;
export const MAX_MAINTENANCE_MINUTES = 12 * 60;
export const MAX_FEEDERS_PER_SCHEDULE = 20;
export const SLOT_MINUTES = [60, 90, 120] as const;

/** "2026-10-10T18:00" (a datetime-local value, read as Dhaka time) → the instant. */
export const dhakaDateTime = (value: string) => new Date(`${value}:00+06:00`);

const localDateTime = (message: string) =>
  z.string(message).regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, message);

export const scheduleFormSchema = z
  .object({
    type: z.enum(["LOAD_SHEDDING", "MAINTENANCE"], "Choose a type"),
    feederIds: z
      .array(z.uuid())
      .min(1, "Choose at least one feeder")
      .max(MAX_FEEDERS_PER_SCHEDULE, `At most ${MAX_FEEDERS_PER_SCHEDULE} feeders at once`),
    startTime: localDateTime("Choose when it starts"),
    endTime: localDateTime("Choose when it ends"),
    reason: z.union([
      z.literal(""),
      z
        .string()
        .trim()
        .min(3, "The reason must be at least 3 characters long")
        .max(300, "The reason cannot be longer than 300 characters"),
    ]),
  })
  .superRefine((values, ctx) => {
    const start = dhakaDateTime(values.startTime).getTime();
    const minutes = (dhakaDateTime(values.endTime).getTime() - start) / 60_000;

    if (start <= Date.now()) {
      ctx.addIssue({ code: "custom", path: ["startTime"], message: "The start must be in the future" });
    }

    if (minutes <= 0) {
      ctx.addIssue({ code: "custom", path: ["endTime"], message: "The end must be after the start" });
    } else if (minutes < MIN_SCHEDULE_MINUTES) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: `A schedule must last at least ${MIN_SCHEDULE_MINUTES} minutes`,
      });
    } else if (values.type === "LOAD_SHEDDING" && minutes > MAX_LOAD_SHEDDING_MINUTES) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "A load-shedding block can last at most 4 hours",
      });
    } else if (values.type === "MAINTENANCE" && minutes > MAX_MAINTENANCE_MINUTES) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "A maintenance window can last at most 12 hours",
      });
    }
  });

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

// Dropdowns hold strings, so the hours and the slot length stay strings in the
// form; toGeneratorRequest turns them into the numbers the API takes.
const hour = (message: string) => z.string(message).regex(/^\d{1,2}$/, message);

export const generatorFormSchema = z
  .object({
    scopeType: z.enum(["ZONE", "SUBSTATION"]),
    scopeId: z.uuid("Choose where to shed load"),
    date: z.string("Choose a day").regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a day"),
    startHour: hour("Choose a start hour"),
    endHour: hour("Choose an end hour"),
    slotMinutes: z.enum(["60", "90", "120"], "Choose a slot length"),
    deficitMW: megawattsSchema("shortfall"),
  })
  .superRefine((values, ctx) => {
    const startHour = Number(values.startHour);
    const endHour = Number(values.endHour);
    const slotMinutes = Number(values.slotMinutes);

    if (endHour <= startHour) {
      ctx.addIssue({ code: "custom", path: ["endHour"], message: "The end must be after the start" });

      return;
    }

    if (((endHour - startHour) * 60) % slotMinutes !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["slotMinutes"],
        message: `The window does not divide into whole ${slotMinutes}-minute slots`,
      });
    }

    const start = dhakaDateTime(`${values.date}T${values.startHour.padStart(2, "0")}:00`);

    if (start.getTime() <= Date.now()) {
      ctx.addIssue({
        code: "custom",
        path: ["startHour"],
        message: "The window must start in the future (Dhaka time)",
      });
    }
  });

export type GeneratorFormValues = z.infer<typeof generatorFormSchema>;

/** The body of POST /schedules/generate. */
export const toGeneratorRequest = (
  { scopeType, scopeId, startHour, endHour, slotMinutes, ...rest }: GeneratorFormValues,
  dryRun: boolean,
) => ({
  ...(scopeType === "ZONE" ? { zoneId: scopeId } : { substationId: scopeId }),
  ...rest,
  startHour: Number(startHour),
  endHour: Number(endHour),
  slotMinutes: Number(slotMinutes),
  dryRun,
});
