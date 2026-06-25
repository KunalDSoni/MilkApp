/**
 * Axios instance with:
 *  - Bearer access-token injection
 *  - Single-flight refresh on 401 (concurrent requests queue behind one refresh)
 *  - Session-expiry callback so the auth layer can route to login
 */
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/core/config/env";
import {
  Tokens,
  getAccessTokenSync,
  getRefreshTokenSync,
  saveTokens,
} from "@/core/auth/session";

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let onSessionExpired: (() => void) | null = null;

/** Registered by AuthProvider; called when refresh fails irrecoverably. */
export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessTokenSync();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Single-flight refresh ────────────────────────────────────────────────
let refreshPromise: Promise<Tokens> | null = null;

async function refreshTokens(): Promise<Tokens> {
  const refreshToken = getRefreshTokenSync();
  if (!refreshToken) throw new Error("No refresh token");

  // Raw axios call (not apiClient) to avoid interceptor recursion.
  const { data } = await axios.post(
    `${env.apiUrl}/auth/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" }, timeout: 15000 },
  );
  const tokens: Tokens = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? refreshToken,
  };
  await saveTokens(tokens);
  return tokens;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isRefreshCall = original?.url?.includes("/auth/refresh");

    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;
      try {
        refreshPromise ??= refreshTokens();
        const tokens = await refreshPromise;
        original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return apiClient(original);
      } catch (refreshError) {
        onSessionExpired?.();
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  },
);
