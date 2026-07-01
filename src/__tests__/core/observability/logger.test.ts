describe('logger', () => {
  const OLD_DEV = (global as any).__DEV__;

  afterEach(() => {
    (global as any).__DEV__ = OLD_DEV;
  });

  it('info: logs in dev only', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    (global as any).__DEV__ = true;
    const { logger } = require('@/core/observability/logger');
    logger.info('test message', { key: 'val' });
    expect(spy).toHaveBeenCalledWith('[info] test message', { key: 'val' });
    spy.mockRestore();
  });

  it('info: does not log in production', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    (global as any).__DEV__ = false;
    const { logger } = require('@/core/observability/logger');
    logger.info('test message');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('warn: always logs', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    (global as any).__DEV__ = false;
    const { logger } = require('@/core/observability/logger');
    logger.warn('warning', { issue: 'test' });
    expect(spy).toHaveBeenCalledWith('[warn] warning', { issue: 'test' });
    spy.mockRestore();
  });

  it('error: logs + Sentry if configured', () => {
    jest.mock('@/core/config/env', () => ({
      env: { apiUrl: 'http://test.com', useMocks: true, sentryDsn: 'https://sentry.io/dsn' },
    }));
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const { logger } = require('@/core/observability/logger');
    logger.error(new Error('boom'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    jest.unmock('@/core/config/env');
  });

  it('error: logs without Sentry if not configured', () => {
    jest.mock('@/core/config/env', () => ({
      env: { apiUrl: 'http://test.com', useMocks: true, sentryDsn: undefined },
    }));
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const { logger } = require('@/core/observability/logger');
    logger.error(new Error('boom'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    jest.unmock('@/core/config/env');
  });
});
