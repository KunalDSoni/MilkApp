/**
 * Secure token storage. On native, tokens live in the OS keystore via
 * expo-secure-store, never in AsyncStorage. On web (which expo-secure-store
 * does not support) we fall back to localStorage. An in-memory cache avoids
 * repeated async reads on the request hot-path (the axios interceptor reads
 * the access token on every call).
 */
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_KEY = "auth.accessToken";
const REFRESH_KEY = "auth.refreshToken";

/**
 * Storage adapter. expo-secure-store has no web implementation, so on web we
 * use localStorage. This is not "secure" storage, but the web build is intended
 * for development/preview only.
 */
export const storage = {
  getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return Promise.resolve(globalThis.localStorage?.getItem(key) ?? null);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  deleteItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      globalThis.localStorage?.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

let cache: Tokens | null = null;

export async function loadTokens(): Promise<Tokens | null> {
  if (cache) return cache;
  const [accessToken, refreshToken] = await Promise.all([
    storage.getItem(ACCESS_KEY),
    storage.getItem(REFRESH_KEY),
  ]);
  if (!accessToken || !refreshToken) return null;
  cache = { accessToken, refreshToken };
  return cache;
}

export async function saveTokens(tokens: Tokens): Promise<void> {
  cache = tokens;
  await Promise.all([
    storage.setItem(ACCESS_KEY, tokens.accessToken),
    storage.setItem(REFRESH_KEY, tokens.refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  cache = null;
  await Promise.all([
    storage.deleteItem(ACCESS_KEY),
    storage.deleteItem(REFRESH_KEY),
  ]);
}

/** Synchronous read of the cached access token for the request interceptor. */
export function getAccessTokenSync(): string | null {
  return cache?.accessToken ?? null;
}

export function getRefreshTokenSync(): string | null {
  return cache?.refreshToken ?? null;
}
