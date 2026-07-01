describe('env', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.unmock('@/core/config/env');
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('loads from env vars', () => {
    process.env.EXPO_PUBLIC_API_URL = 'https://test.api.com';
    process.env.EXPO_PUBLIC_USE_MOCKS = 'false';
    process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://sentry.io/dsn';
    const { env } = require('@/core/config/env');
    expect(env.apiUrl).toBe('https://test.api.com');
    expect(env.useMocks).toBe(false);
    expect(env.sentryDsn).toBe('https://sentry.io/dsn');
  });

  it('invalid config -> throws', () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    process.env.EXPO_PUBLIC_API_URL = 'not-a-url';
    expect(() => require('@/core/config/env')).toThrow('Invalid environment configuration');
  });

  it('default values applied', () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    delete process.env.EXPO_PUBLIC_USE_MOCKS;
    delete process.env.EXPO_PUBLIC_SENTRY_DSN;
    const { env } = require('@/core/config/env');
    expect(env.apiUrl).toBe('https://api.dairyplatform.example.com');
    expect(env.useMocks).toBe(true);
    expect(env.sentryDsn).toBeUndefined();
  });
});
