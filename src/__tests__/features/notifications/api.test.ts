import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/features/notifications/api';
import { apiClient } from '@/core/api/client';

jest.mock('@/core/config/env', () => ({
  env: { apiUrl: 'https://api.example.com', useMocks: false, sentryDsn: undefined },
}));

describe('notifications API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchNotifications: returns list', async () => {
    jest.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        items: [{ id: 'n1', type: 'BROADCAST', title: 'Test', body: 'Body', createdAt: '2026-07-01T00:00:00Z', read: false }],
        nextPage: null,
        unreadCount: 1,
      },
    });
    const result = await fetchNotifications(0);
    expect(result.items).toHaveLength(1);
    expect(result.unreadCount).toBe(1);
  });

  it('markRead: calls correct endpoint', async () => {
    jest.spyOn(apiClient, 'post').mockResolvedValue({});
    await markNotificationRead('n1');
    expect(apiClient.post).toHaveBeenCalledWith('/notifications/n1/read');
  });

  it('markAllRead: calls correct endpoint', async () => {
    jest.spyOn(apiClient, 'post').mockResolvedValue({});
    await markAllNotificationsRead();
    expect(apiClient.post).toHaveBeenCalledWith('/notifications/read-all');
  });

  it('fetchNotifications: handles 404', async () => {
    jest.spyOn(apiClient, 'get').mockRejectedValue({ response: { status: 404 } });
    const result = await fetchNotifications(0);
    expect(result.items).toEqual([]);
    expect(result.unreadCount).toBe(0);
  });
});
