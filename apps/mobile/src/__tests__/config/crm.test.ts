describe('crm config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns enabled config when env is set', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_CRM_ENABLED = 'true';
    const { getCRMConfig } = require('@/config/crm');
    const config = getCRMConfig();
    expect(config.enabled).toBe(true);
    expect(config.apiBaseUrl).toContain('crm-proxy');
  });

  it('returns disabled when CRM_ENABLED is not true', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_CRM_ENABLED = 'false';
    const { getCRMConfig } = require('@/config/crm');
    expect(getCRMConfig().enabled).toBe(false);
  });

  it('returns disabled when no supabase URL', () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    process.env.EXPO_PUBLIC_CRM_ENABLED = 'true';
    const { getCRMConfig } = require('@/config/crm');
    expect(getCRMConfig().enabled).toBe(false);
  });

  it('isCRMEnabled returns boolean', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_CRM_ENABLED = 'true';
    const { isCRMEnabled } = require('@/config/crm');
    expect(isCRMEnabled()).toBe(true);
  });

  it('apiKey is empty (server-side only)', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    const { getCRMConfig } = require('@/config/crm');
    expect(getCRMConfig().apiKey).toBe('');
  });

  it('builds correct proxy URL', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co';
    const { getCRMConfig } = require('@/config/crm');
    expect(getCRMConfig().apiBaseUrl).toBe('https://abc.supabase.co/functions/v1/crm-proxy');
  });
});
