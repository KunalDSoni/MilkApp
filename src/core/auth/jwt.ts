/**
 * Minimal JWT payload decoder. The backend's /auth/otp/verify returns tokens
 * only (no user object, no /auth/me endpoint), so the retailer's identity is
 * read from the access-token claims. This does NOT verify the signature — the
 * server is the trust boundary; we only read non-sensitive routing claims.
 */
import { User } from "@/features/auth/schemas";

interface JwtClaims {
  sub: string;
  role?: string;
  distributorId?: string;
  retailerId?: string;
  name?: string;
  phone?: string;
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 ? "=".repeat(4 - (padded.length % 4)) : "";
  // atob is available in Hermes/RN runtime.
  return atob(padded + pad);
}

export function decodeJwt(token: string): JwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload)) as JwtClaims;
  } catch {
    return null;
  }
}

/** Build the app's User model from access-token claims. */
export function userFromToken(accessToken: string, phone: string): User {
  const claims = decodeJwt(accessToken);
  return {
    id: claims?.retailerId ?? claims?.sub ?? "unknown",
    name: claims?.name ?? "Retailer",
    phone: claims?.phone ?? phone,
    shopName: null,
    distributorId: claims?.distributorId ?? null,
  };
}
