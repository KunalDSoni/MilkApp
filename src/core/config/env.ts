/**
 * Typed, validated access to runtime configuration.
 * Only EXPO_PUBLIC_* vars are available in the client bundle.
 */
import { z } from "zod";

const schema = z.object({
  apiUrl: z.string().url(),
  useMocks: z.boolean(),
  sentryDsn: z.string().optional(),
});

function toBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true" || value === "1";
}

const parsed = schema.safeParse({
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "https://api.dairyplatform.example.com",
  useMocks: toBool(process.env.EXPO_PUBLIC_USE_MOCKS, true),
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN || undefined,
});

if (!parsed.success) {
  // Fail loud in dev; never ship with broken config.
  console.error("Invalid environment configuration", parsed.error.flatten());
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
