/**
 * TanStack Query client + offline persistence.
 * - Mutations never auto-retry by default (avoid double-submits like confirm).
 * - GET queries retry with backoff, but not on 4xx client errors.
 * - Cache persists to AsyncStorage so products/orders are viewable offline.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, onlineManager } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import NetInfo from "@react-native-community/netinfo";
import { normalizeError } from "./errors";

// Bridge NetInfo connectivity into TanStack's online state so retries/paused
// mutations resume automatically when the network returns.
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected));
  });
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 24 * 60 * 60 * 1000,
      retry: (failureCount, error) => {
        const { status, isNetwork } = normalizeError(error);
        if (!isNetwork && status >= 400 && status < 500) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "dairy-retailer-query-cache",
});
