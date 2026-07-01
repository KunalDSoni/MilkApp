jest.mock('@/core/config/env', () => ({
  env: { apiUrl: 'https://api.example.com', useMocks: false, sentryDsn: undefined },
}));

jest.mock('@/core/auth/session', () => {
  let token: string | null = null;
  let refresh: string | null = null;
  return {
    getAccessTokenSync: jest.fn(() => token),
    getRefreshTokenSync: jest.fn(() => refresh),
    saveTokens: jest.fn(async (tokens: any) => {
      token = tokens.accessToken;
      refresh = tokens.refreshToken;
    }),
  };
});

import { apiClient, setSessionExpiredHandler } from '@/core/api/client';
import * as session from '@/core/auth/session';

describe('apiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (session.getAccessTokenSync as jest.Mock).mockReturnValue(null);
    (session.getRefreshTokenSync as jest.Mock).mockReturnValue(null);
  });

  it('creates with correct baseURL and headers', () => {
    expect(apiClient.defaults.baseURL).toBe('https://api.example.com');
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    expect(apiClient.defaults.timeout).toBe(15000);
  });

  it('injects Bearer token on requests', async () => {
    (session.getAccessTokenSync as jest.Mock).mockReturnValue('test-token');
    const interceptor = apiClient.interceptors.request as any;
    const handler = interceptor.handlers.find(
      (h: any) => h.fulfilled && h.fulfilled.toString().includes('Authorization'),
    )?.fulfilled;
    const config = { headers: { Authorization: undefined } };
    if (handler) await handler(config);
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('no token -> no Authorization header', async () => {
    const interceptor = apiClient.interceptors.request as any;
    const handler = interceptor.handlers.find(
      (h: any) => h.fulfilled && h.fulfilled.toString().includes('Authorization'),
    )?.fulfilled;
    const config = { headers: {} };
    if (handler) await handler(config);
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('intercepts 401 -> calls refresh', async () => {
    const onExpired = jest.fn();
    setSessionExpiredHandler(onExpired);
    (session.getRefreshTokenSync as jest.Mock).mockReturnValue('refresh-token');
    (session.saveTokens as jest.Mock).mockResolvedValue(undefined);

    const mockPost = jest.fn().mockResolvedValue({
      data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    });
    (apiClient as any).post = mockPost;

    const error = {
      config: { url: '/test', headers: {} },
      response: { status: 401 },
    };
    const interceptor = apiClient.interceptors.response as any;
    const handler = interceptor.handlers.find((h: any) => h.rejected)?.rejected;

    if (handler) {
      try {
        await handler(error);
      } catch (e) {}
    }

    expect(mockPost).toHaveBeenCalledWith(
      'https://api.example.com/auth/refresh',
      { refreshToken: 'refresh-token' },
      expect.any(Object),
    );
  });

  it('401 + refresh failure -> calls onSessionExpired', async () => {
    const onExpired = jest.fn();
    setSessionExpiredHandler(onExpired);
    (session.getRefreshTokenSync as jest.Mock).mockReturnValue('refresh-token');

    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('refresh failed'));

    const error = {
      config: { url: '/test', headers: {} },
      response: { status: 401 },
    };
    const interceptor = apiClient.interceptors.response as any;
    const handler = interceptor.handlers.find((h: any) => h.rejected)?.rejected;

    if (handler) {
      try {
        await handler(error);
      } catch (e) {}
    }

    expect(onExpired).toHaveBeenCalled();
  });

  it('non-401 errors pass through', async () => {
    const interceptor = apiClient.interceptors.response as any;
    const handler = interceptor.handlers.find((h: any) => h.rejected)?.rejected;

    const error = {
      config: { url: '/test' },
      response: { status: 500, data: {} },
    };

    await expect(handler(error)).rejects.toBe(error);
  });
});
