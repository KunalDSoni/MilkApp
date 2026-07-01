import * as SecureStore from 'expo-secure-store';

jest.mock('@/core/auth/session', () => {
  let cache: { accessToken: string | null; refreshToken: string | null } = {
    accessToken: null,
    refreshToken: null,
  };
  const storage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    deleteItem: jest.fn(),
  };
  return {
    storage,
    loadTokens: jest.fn(async () => {
      if (cache.accessToken && cache.refreshToken) return { accessToken: cache.accessToken, refreshToken: cache.refreshToken };
      const [accessToken, refreshToken] = await Promise.all([
        storage.getItem('auth.accessToken'),
        storage.getItem('auth.refreshToken'),
      ]);
      if (!accessToken || !refreshToken) return null;
      cache = { accessToken, refreshToken };
      return { accessToken, refreshToken };
    }),
    saveTokens: jest.fn(async (tokens: { accessToken: string; refreshToken: string }) => {
      cache = { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
      await Promise.all([
        storage.setItem('auth.accessToken', tokens.accessToken),
        storage.setItem('auth.refreshToken', tokens.refreshToken),
      ]);
    }),
    clearTokens: jest.fn(async () => {
      cache = { accessToken: null, refreshToken: null };
      await Promise.all([
        storage.deleteItem('auth.accessToken'),
        storage.deleteItem('auth.refreshToken'),
      ]);
    }),
    getAccessTokenSync: jest.fn(() => cache.accessToken),
    getRefreshTokenSync: jest.fn(() => cache.refreshToken),
  };
});

import { saveTokens, loadTokens, clearTokens, getAccessTokenSync, getRefreshTokenSync, storage } from '@/core/auth/session';

describe('session', () => {
  beforeEach(async () => {
    await clearTokens();
    jest.clearAllMocks();
  });

  it('saveTokens -> stores in secure store + caches', async () => {
    await saveTokens({ accessToken: 'acc', refreshToken: 'ref' });
    expect(storage.setItem).toHaveBeenCalledWith('auth.accessToken', 'acc');
    expect(storage.setItem).toHaveBeenCalledWith('auth.refreshToken', 'ref');
    expect(getAccessTokenSync()).toBe('acc');
    expect(getRefreshTokenSync()).toBe('ref');
  });

  it('loadTokens -> returns cached first, then storage', async () => {
    await saveTokens({ accessToken: 'cached', refreshToken: 'cached-ref' });
    jest.clearAllMocks();
    const tokens = await loadTokens();
    expect(tokens).toEqual({ accessToken: 'cached', refreshToken: 'cached-ref' });
    expect(storage.getItem).not.toHaveBeenCalled();
  });

  it('loadTokens: no tokens -> null', async () => {
    (storage.getItem as jest.Mock).mockResolvedValue(null);
    const tokens = await loadTokens();
    expect(tokens).toBeNull();
  });

  it('clearTokens -> clears storage + cache', async () => {
    await saveTokens({ accessToken: 'x', refreshToken: 'y' });
    await clearTokens();
    expect(storage.deleteItem).toHaveBeenCalledWith('auth.accessToken');
    expect(storage.deleteItem).toHaveBeenCalledWith('auth.refreshToken');
    expect(getAccessTokenSync()).toBeNull();
  });

  it('getAccessTokenSync -> sync cache read', async () => {
    expect(getAccessTokenSync()).toBeNull();
    await saveTokens({ accessToken: 'sync-test', refreshToken: 'sync-ref' });
    expect(getAccessTokenSync()).toBe('sync-test');
  });

  it('getRefreshTokenSync -> sync cache read', async () => {
    expect(getRefreshTokenSync()).toBeNull();
    await saveTokens({ accessToken: 'x', refreshToken: 'sync-ref' });
    expect(getRefreshTokenSync()).toBe('sync-ref');
  });
});
