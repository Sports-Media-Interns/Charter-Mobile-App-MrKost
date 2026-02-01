describe('env', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns cached env on second call', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    const { validateEnv, getEnv } = require('@/config/env');
    const first = validateEnv();
    const second = getEnv();
    expect(first).toBe(second);
  });

  it('returns defaults in dev mode with invalid env', () => {
    (global as any).__DEV__ = true;
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const { validateEnv } = require('@/config/env');
    const env = validateEnv();
    expect(env.EXPO_PUBLIC_SUPABASE_URL).toBe('https://placeholder.supabase.co');
    expect(env.EXPO_PUBLIC_APP_NAME).toBe('Sports Media Charter');
  });

  it('validates correct env', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    const { validateEnv } = require('@/config/env');
    const env = validateEnv();
    expect(env.EXPO_PUBLIC_SUPABASE_URL).toBe('https://test.supabase.co');
  });

  it('parses CRM_ENABLED as boolean', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    process.env.EXPO_PUBLIC_CRM_ENABLED = 'true';
    const { validateEnv } = require('@/config/env');
    const env = validateEnv();
    expect(env.EXPO_PUBLIC_CRM_ENABLED).toBe(true);
  });

  it('defaults CRM_ENABLED to false', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    const { validateEnv } = require('@/config/env');
    const env = validateEnv();
    expect(env.EXPO_PUBLIC_CRM_ENABLED).toBe(false);
  });

  it('defaults APP_NAME', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    const { validateEnv } = require('@/config/env');
    const env = validateEnv();
    expect(env.EXPO_PUBLIC_APP_NAME).toBe('Sports Media Charter');
  });

  it('getEnv calls validateEnv when not cached', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
    const { getEnv } = require('@/config/env');
    const env = getEnv();
    expect(env).toHaveProperty('EXPO_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    expect(env).toHaveProperty('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'test-key');
  });

  it('throws in production with invalid env', () => {
    (global as any).__DEV__ = false;
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    const { validateEnv } = require('@/config/env');
    expect(() => validateEnv()).toThrow('Missing or invalid environment variables');
    (global as any).__DEV__ = true;
  });
});
