import { createClient } from '@supabase/supabase-js';

describe('supabase client', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('exports a supabase client created with createClient', () => {
    expect(typeof createClient).toBe('function');
  });

  it('createClient returns object with auth, from, channel, and functions', () => {
    const client = createClient('https://test.supabase.co', 'test-key');
    expect(typeof client.auth).toBe('object');
    expect(typeof client.from).toBe('function');
    expect(typeof client.channel).toBe('function');
    expect(typeof client.functions.invoke).toBe('function');
  });
});
