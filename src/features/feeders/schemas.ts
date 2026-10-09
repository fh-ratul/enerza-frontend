import { z } from "zod";

// The API's rules for feeders (its feeder.validation.ts).

export const MAX_AREAS_PER_REQUEST = 20;

const code = (label: string) =>
  z
    .string(`${label} code is required`)
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9-]{3,20}$/, `${label} code must be 3-20 letters, digits or hyphens`);

const name = (label: string) =>
  z
    .string(`${label} name is required`)
    .trim()
    .min(2, `${label} name must be at least 2 characters long`)
    .max(80, `${label} name cannot be longer than 80 characters`);

export const megawattsSchema = (label: string) =>
  z
    .number(`Enter the ${label} in MW`)
    .positive(`The ${label} must be greater than 0`)
    .max(1000, `The ${label} cannot exceed 1000 MW`)
    .refine(
      (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6,
      "Use at most 2 decimal places",
    );

export const feederFormSchema = z.object({
  name: name("Feeder"),
  code: code("Feeder"),
  loadMW: megawattsSchema("connected load"),
  priority: z.enum(["CRITICAL", "HIGH", "NORMAL", "LOW"], "Choose a priority"),
  isActive: z.boolean(),
  substationId: z.uuid("Choose a substation"),
  areas: z
    .array(z.object({ name: name("Area"), code: code("Area") }))
    .max(MAX_AREAS_PER_REQUEST, `At most ${MAX_AREAS_PER_REQUEST} areas can be added at once`)
    .superRefine((areas, ctx) => {
      const seen = new Set<string>();

      areas.forEach((area, index) => {
        const key = area.code.trim().toUpperCase();

        if (seen.has(key)) {
          ctx.addIssue({
            code: "custom",
            path: [index, "code"],
            message: `Area code ${key} is used twice`,
          });
        }

        seen.add(key);
      });
    }),
});

export type FeederFormValues = z.infer<typeof feederFormSchema>;
