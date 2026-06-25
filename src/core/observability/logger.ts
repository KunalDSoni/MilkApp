/**
 * Lightweight logging/observability seam. Wraps console today; wire Sentry
 * (or another backend) here without touching call sites.
 *
 * To enable Sentry in production:
 *   1. add @sentry/react-native, run its wizard
 *   2. init in app/_layout with env.sentryDsn
 *   3. forward captureException/captureMessage below
 */
import { env } from "@/core/config/env";

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    if (__DEV__) console.log(`[info] ${message}`, context ?? "");
  },
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(`[warn] ${message}`, context ?? "");
  },
  error(error: unknown, context?: Record<string, unknown>) {
    console.error("[error]", error, context ?? "");
    if (env.sentryDsn) {
      // Sentry.Native.captureException(error, { extra: context });
    }
  },
};
