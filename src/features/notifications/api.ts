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

export async function fetchNotifications(page: number): Promise<NotificationList> {
  if (env.useMocks) {
    await delay(250);
    const start = page * PAGE_SIZE;
    const items = mockNotifications.slice(start, start + PAGE_SIZE);
    const nextPage = start + PAGE_SIZE < mockNotifications.length ? page + 1 : null;
    const unreadCount = mockNotifications.filter((n) => !n.read).length;
    return notificationListSchema.parse({ items, nextPage, unreadCount });
  }
  const { data } = await apiClient.get("/notifications", { params: { page } });
  return notificationListSchema.parse(data);
}

export async function markNotificationRead(id: string): Promise<void> {
  if (env.useMocks) {
    mockMarkRead(id);
    return;
  }
  await apiClient.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  if (env.useMocks) {
    mockMarkAll();
    return;
  }
  await apiClient.post("/notifications/read-all");
}
