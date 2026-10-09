import { z } from "zod";

// The API's rules for bills and payments (its bill.validation.ts and payment.validation.ts).

export const BILL_STATUSES = ["UNPAID", "PAID", "CANCELLED"] as const;
export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "CANCELLED", "EXPIRED"] as const;
export const PAYMENT_GATEWAYS = ["BKASH", "SSLCOMMERZ"] as const;

export const BILL_SORTABLE_FIELDS = [
  "createdAt",
  "dueDate",
  "billingMonth",
  "totalAmount",
  "unitsConsumed",
  "status",
  "paidAt",
] as const;

export const issueBillSchema = z.object({
  customerId: z.uuid("Choose a customer"),
  billingMonth: z
    .string("Choose the billing month")
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Choose the billing month"),
  currentReading: z
    .number("Enter the meter reading")
    .int("The reading must be a whole number of kWh")
    .min(0, "The reading cannot be negative")
    .max(99_999_999, "The reading is too large"),
});

export type IssueBillValues = z.infer<typeof issueBillSchema>;
