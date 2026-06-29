import { z } from "zod";

/** Indian mobile number: 10 digits starting 6–9. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

export const loginFormSchema = z.object({
  phone: phoneSchema,
});

export const otpFormSchema = z.object({
  otp: otpSchema,
});

export type LoginForm = z.infer<typeof loginFormSchema>;
export type OtpForm = z.infer<typeof otpFormSchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  role: z.string().nullable().optional(),
  shopName: z.string().nullable().optional(),
  distributorId: z.string().nullable().optional(),
});

export type User = z.infer<typeof userSchema>;

// Backend: POST /auth/otp/request → { message } (neutral, no enumeration).
export const otpRequestResponseSchema = z.object({
  message: z.string().optional(),
});

// Backend: POST /auth/otp/verify → { accessToken, refreshToken, expiresIn }.
// No user object is returned; identity is derived from the JWT claims.
export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().optional(),
});
export type AuthTokens = z.infer<typeof authTokensSchema>;

/** Internal result the screen passes to AuthProvider.signIn. */
export interface VerifyResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/** Convert a 10-digit Indian mobile to the backend's E.164 format. */
export function toE164(tenDigits: string): string {
  return `+91${tenDigits}`;
}
