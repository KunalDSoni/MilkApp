/**
 * Auth API — aligned to @moderns-milk/contracts.
 *   POST /auth/otp/request { phone: E.164 } → { message }
 *   POST /auth/otp/verify  { phone, code }  → { accessToken, refreshToken, expiresIn }
 *   POST /auth/logout (204)
 * The verify response has NO user object, so we derive identity from the JWT.
 * Mock mode keeps the full flow working offline; the mock OTP is "123456".
 */
import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import { userFromToken } from "@/core/auth/jwt";
import {
  VerifyResult,
  authTokensSchema,
  otpRequestResponseSchema,
  toE164,
} from "./schemas";

const MOCK_OTP = "123456";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** `phone` is the raw 10-digit number; converted to E.164 for the backend. */
export async function requestOtp(phone: string): Promise<{ expiresIn: number }> {
  if (env.useMocks) {
    await delay(600);
    return { expiresIn: 30 };
  }
  const { data } = await apiClient.post("/auth/otp/request", {
    phone: toE164(phone),
  });
  otpRequestResponseSchema.parse(data);
  return { expiresIn: 30 };
}

export async function verifyOtp(phone: string, code: string): Promise<VerifyResult> {
  if (env.useMocks) {
    await delay(600);
    if (code !== MOCK_OTP) {
      const error = new Error("Invalid code. In mock mode the code is 123456.");
      (error as { status?: number }).status = 401;
      throw error;
    }
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        id: "ret_1",
        name: "Demo Retailer",
        phone,
        shopName: "Demo Dairy Mart",
        distributorId: "dist_1",
      },
    };
  }
  const { data } = await apiClient.post("/auth/otp/verify", {
    phone: toE164(phone),
    code,
  });
  const tokens = authTokensSchema.parse(data);
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: userFromToken(tokens.accessToken, phone),
  };
}

export async function logout(): Promise<void> {
  if (env.useMocks) return;
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // Best-effort; local session is cleared regardless.
  }
}
