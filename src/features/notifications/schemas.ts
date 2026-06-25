import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "ORDER_REMINDER",
  "CUTOFF_REMINDER",
  "ORDER_CONFIRMATION",
  "BROADCAST",
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
  read: z.boolean(),
  /** Deep-link route the app should open when tapped. */
  route: z.string().optional(),
});
export type AppNotification = z.infer<typeof notificationSchema>;

export const notificationListSchema = z.object({
  items: z.array(notificationSchema),
  nextPage: z.number().nullable(),
  unreadCount: z.number().int().nonnegative(),
});
export type NotificationList = z.infer<typeof notificationListSchema>;
