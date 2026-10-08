import { z } from "zod";

export const CONTACT_TOPICS = [
  { value: "OUTAGE", label: "An outage or a schedule" },
  { value: "BILLING", label: "A bill or a payment" },
  { value: "ACCOUNT", label: "My account" },
  { value: "OTHER", label: "Something else" },
] as const;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(60, "Name cannot be longer than 60 characters"),
  email: z.email("Enter a valid email address").max(120, "Email is too long"),
  topic: z.enum(
    CONTACT_TOPICS.map((topic) => topic.value),
    "Choose what your message is about",
  ),
  message: z
    .string()
    .trim()
    .min(20, "Please describe your question in at least 20 characters")
    .max(1500, "Message cannot be longer than 1500 characters"),
  // Hidden from people; a bot that fills every field gives itself away.
  website: z.string().max(0).optional(),
});

export type ContactValues = z.infer<typeof contactSchema>;
