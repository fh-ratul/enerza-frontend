import { z } from "zod";

// The API's rules for outages (its outage.validation.ts and upload limits).

export const OUTAGE_STATUSES = ["REPORTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CANCELLED"] as const;
export const OUTAGE_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const description = z
  .string("Describe what happened")
  .trim()
  .min(5, "Please describe the problem in at least 5 characters")
  .max(500, "Description cannot be longer than 500 characters");

export const reportOutageSchema = z.object({ description });
export type ReportOutageValues = z.infer<typeof reportOutageSchema>;

/** An admin logging an incident names the feeder; a customer's comes from their area. */
export const createIncidentSchema = z.object({
  feederId: z.uuid("Choose a feeder"),
  description,
});
export type CreateIncidentValues = z.infer<typeof createIncidentSchema>;

/** The note that goes with closing an outage or cancelling a schedule. */
export const noteSchema = (min = 5, max = 500) =>
  z.object({
    note: z
      .string("A note is required")
      .trim()
      .min(min, `Write at least ${min} characters`)
      .max(max, `Keep it under ${max} characters`),
  });
export type StatusNoteValues = { note: string };
