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

/** Resolving and cancelling both need a note. */
export const statusNoteSchema = z.object({
  note: z
    .string("A note is required")
    .trim()
    .min(5, "The note must be at least 5 characters long")
    .max(500, "The note cannot be longer than 500 characters"),
});
export type StatusNoteValues = z.infer<typeof statusNoteSchema>;
