import { z } from "zod";
import { contactNumberSchema, meterNumberSchema, nameSchema } from "@/features/auth/schemas";

// The API's rules for PATCH /users/me (its user.validation.ts). An empty box
// means "not given": it is sent as null, which clears the value.

const optionalContactNumber = z.union([z.literal(""), contactNumberSchema]);

export const customerProfileSchema = z.object({
  name: nameSchema,
  contactNumber: optionalContactNumber,
  address: z.union([
    z.literal(""),
    z
      .string()
      .trim()
      .min(5, "Address must be at least 5 characters long")
      .max(200, "Address cannot be longer than 200 characters"),
  ]),
  areaId: z.uuid("Choose your area"),
  meterNumber: meterNumberSchema,
});

export type CustomerProfileValues = z.infer<typeof customerProfileSchema>;

export const technicianProfileSchema = z.object({
  name: nameSchema,
  contactNumber: optionalContactNumber,
});

export type TechnicianProfileValues = z.infer<typeof technicianProfileSchema>;
