import { z } from "zod";

// The same rules the API enforces (its auth.validation.ts), so a form never
// sends something the API would turn down.

export const emailSchema = z
  .string("Email is required")
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "lower", label: "A lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { id: "upper", label: "An uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { id: "digit", label: "A number", test: (value: string) => /[0-9]/.test(value) },
  {
    id: "special",
    label: "A special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
] as const;

export const passwordSchema = z
  .string("Password is required")
  .min(8, "Password must be at least 8 characters long")
  .max(72, "Password cannot be longer than 72 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const nameSchema = z
  .string("Name is required")
  .trim()
  .min(2, "Name must be at least 2 characters long")
  .max(60, "Name cannot be longer than 60 characters");

export const contactNumberSchema = z
  .string()
  .trim()
  .regex(/^(\+?88)?01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number, e.g. 01712345678");

export const meterNumberSchema = z
  .string("Meter number is required")
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{4,30}$/, "Meter number must be 4-30 letters, digits or hyphens");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string("Password is required").min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

/** What the API's POST /auth/register accepts. */
export const registerPayloadSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  contactNumber: contactNumberSchema.optional(),
  areaId: z.uuid("Choose your area"),
  meterNumber: meterNumberSchema,
  connectionType: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
});

export type RegisterPayload = z.infer<typeof registerPayloadSchema>;

/** The registration form: the payload plus what only the form needs. */
export const registerFormSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string("Confirm your password").min(1, "Confirm your password"),
    // An empty box means "not given"; anything typed has to be a valid number.
    contactNumber: z.union([z.literal(""), contactNumberSchema]),
    areaId: z.uuid("Choose your area"),
    meterNumber: meterNumberSchema,
    connectionType: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "The two passwords do not match",
  });

export type RegisterFormValues = z.input<typeof registerFormSchema>;
