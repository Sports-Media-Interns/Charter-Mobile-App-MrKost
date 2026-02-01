describe('logger', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('logs debug in dev mode', () => {
    (global as any).__DEV__ = true;
    const spy = jest.spyOn(console, 'log').mockImplementation();
    const { logger } = require('@/utils/logger');
    logger.debug('test');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logs info in dev mode', () => {
    (global as any).__DEV__ = true;
    const spy = jest.spyOn(console, 'info').mockImplementation();
    const { logger } = require('@/utils/logger');
    logger.info('test');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logs warn in dev mode', () => {
    (global as any).__DEV__ = true;
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const { logger } = require('@/utils/logger');
    logger.warn('test');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('always logs errors', () => {
    (global as any).__DEV__ = false;
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const { logger } = require('@/utils/logger');
    logger.error('test error');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('suppresses debug in production', () => {
    (global as any).__DEV__ = false;
    const spy = jest.spyOn(console, 'log').mockImplementation();
    const { logger } = require('@/utils/logger');
    logger.debug('test');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('suppresses info in production', () => {
    (global as any).__DEV__ = false;
    const spy = jest.spyOn(console, 'info').mockImplementation();
    const { logger } = require('@/utils/logger');
    logger.info('test');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
