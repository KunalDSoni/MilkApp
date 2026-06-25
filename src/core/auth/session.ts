/**
 * Secure token storage. Tokens live in the OS keystore via expo-secure-store,
 * never in AsyncStorage. In-memory cache avoids repeated async reads on the
 * request hot-path (the axios interceptor reads the access token on every call).
 */
import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "auth.accessToken";
const REFRESH_KEY = "auth.refreshToken";

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

let cache: Tokens | null = null;

export async function loadTokens(): Promise<Tokens | null> {
  if (cache) return cache;
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY),
  ]);
  if (!accessToken || !refreshToken) return null;
  cache = { accessToken, refreshToken };
  return cache;
}

export async function saveTokens(tokens: Tokens): Promise<void> {
  cache = tokens;
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  cache = null;
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}

/** Synchronous read of the cached access token for the request interceptor. */
export function getAccessTokenSync(): string | null {
  return cache?.accessToken ?? null;
}

export function getRefreshTokenSync(): string | null {
  return cache?.refreshToken ?? null;
}
