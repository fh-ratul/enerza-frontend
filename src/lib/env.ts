import "server-only";
import { z } from "zod";

// Empty values (e.g. `SMTP_USER=`) count as "not set".
const optional = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const envSchema = z.object({
  API_URL: z
    .url("API_URL must be the Enerza API base URL, e.g. http://localhost:5000/api/v1")
    .transform((value) => value.replace(/\/+$/, "")),
  INTERNAL_API_KEY: optional,
  JWT_ACCESS_SECRET: optional,
  SMTP_USER: optional,
  SMTP_PASSWORD: optional,
  CONTACT_INBOX: optional,
});

export type ServerEnv = z.infer<typeof envSchema>;

let cached: ServerEnv | undefined;

/**
 * Server-side configuration, validated on first use rather than at import
 * time: a missing variable then fails the request that needs it with a clear
 * message, instead of breaking every page (and the build) at once.
 */
export const getServerEnv = (): ServerEnv => {
  if (cached) {
    return cached;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid server environment. ${problems}`);
  }

  cached = parsed.data;

  return cached;
};
