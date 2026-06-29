/**
 * Today's Beat check-in state. There is no GET /sales-visits endpoint, so
 * "visited / skipped" is tracked on-device. Persisted to AsyncStorage so a
 * rep's progress survives an app restart during the day. Keyed by local date,
 * so each day starts fresh without any cleanup.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type BeatStatus = "VISITED" | "SKIPPED";

/** Local YYYY-MM-DD (not UTC) so the beat rolls over at the rep's midnight. */
export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

interface BeatState {
  // dateKey -> customerId -> status
  byDate: Record<string, Record<string, BeatStatus>>;
  setStatus: (customerId: string, status: BeatStatus) => void;
  clearStatus: (customerId: string) => void;
}

export const useBeat = create<BeatState>()(
  persist(
    (set) => ({
      byDate: {},
      setStatus: (customerId, status) =>
        set((s) => {
          const key = todayKey();
          const day = { ...(s.byDate[key] ?? {}), [customerId]: status };
          return { byDate: { ...s.byDate, [key]: day } };
        }),
      clearStatus: (customerId) =>
        set((s) => {
          const key = todayKey();
          const day = { ...(s.byDate[key] ?? {}) };
          delete day[customerId];
          return { byDate: { ...s.byDate, [key]: day } };
        }),
    }),
    {
      name: "beat-checkins",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Today's statuses (re-renders subscribers when the day's map changes). */
export function useTodayStatuses(): Record<string, BeatStatus> {
  return useBeat((s) => s.byDate[todayKey()] ?? {});
}
