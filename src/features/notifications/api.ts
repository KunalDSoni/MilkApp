import { apiClient } from "@/core/api/client";
import { env } from "@/core/config/env";
import { NotificationList, notificationListSchema } from "./schemas";
import {
  markAllRead as mockMarkAll,
  markNotificationRead as mockMarkRead,
  notifications as mockNotifications,
} from "@/features/_mocks/db";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const PAGE_SIZE = 10;

const EMPTY_LIST: NotificationList = { items: [], nextPage: null, unreadCount: 0 };

/**
 * The notifications backend isn't implemented yet (Slice 2). When the endpoint
 * is missing the API replies 404 — treat that as "no notifications" rather than
 * surfacing an error. Once the backend ships the module, these calls just work.
 */
function isEndpointMissing(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response?.status;
  return status === 404 || status === 501;
}

export async function fetchNotifications(page: number): Promise<NotificationList> {
  if (env.useMocks) {
    await delay(250);
    const start = page * PAGE_SIZE;
    const items = mockNotifications.slice(start, start + PAGE_SIZE);
    const nextPage = start + PAGE_SIZE < mockNotifications.length ? page + 1 : null;
    const unreadCount = mockNotifications.filter((n) => !n.read).length;
    return notificationListSchema.parse({ items, nextPage, unreadCount });
  }
  try {
    const { data } = await apiClient.get("/notifications", { params: { page } });
    return notificationListSchema.parse(data);
  } catch (error) {
    if (isEndpointMissing(error)) return EMPTY_LIST;
    throw error;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  if (env.useMocks) {
    mockMarkRead(id);
    return;
  }
  try {
    await apiClient.post(`/notifications/${id}/read`);
  } catch (error) {
    if (!isEndpointMissing(error)) throw error;
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  if (env.useMocks) {
    mockMarkAll();
    return;
  }
  try {
    await apiClient.post("/notifications/read-all");
  } catch (error) {
    if (!isEndpointMissing(error)) throw error;
  }
}
