import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

jest.mock('@/store', () => ({
  useAuthStore: jest.fn(() => ({
    user: { id: 'u1' },
    session: { access_token: 'tok' },
  })),
}));

jest.mock('@/services/supabase', () => {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    is: jest.fn().mockResolvedValue({ count: 0, error: null }),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
  };
  const mockFunctionsInvoke = jest.fn().mockResolvedValue({ data: {}, error: null });
  return {
    supabase: {
      from: jest.fn(() => chain),
      functions: { invoke: mockFunctionsInvoke },
    },
    _chain: chain,
    _functionsInvoke: mockFunctionsInvoke,
  };
});

const { supabase: mockSupabase, _chain: mockChain, _functionsInvoke: mockFunctionsInvoke } =
  require('@/services/supabase');

import { useNotifications, useUnreadCount, useMarkNotificationsRead } from '@/hooks/useNotifications';

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChain.select.mockReturnThis();
    mockChain.eq.mockReturnThis();
    mockChain.order.mockReturnThis();
    mockChain.limit.mockResolvedValue({ data: [], error: null });
    mockChain.is.mockResolvedValue({ count: 0, error: null });
    (useQuery as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ user: { id: 'u1' }, session: { access_token: 'tok' } });
  });

  it('queries with user id key', () => {
    useNotifications();
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['notifications', 'u1'] })
    );
  });

  it('enabled when user exists', () => {
    useNotifications();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    expect(config.enabled).toBe(true);
  });

  it('returns empty when no user', async () => {
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ user: null, session: null });
    useNotifications();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(result).toEqual([]);
  });

  it('queryFn fetches notifications from supabase', async () => {
    const mockData = [{ id: 'n1', message: 'New booking' }];
    mockChain.limit.mockResolvedValueOnce({ data: mockData, error: null });
    useNotifications();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
    expect(mockChain.select).toHaveBeenCalledWith('*');
    expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(mockChain.limit).toHaveBeenCalledWith(50);
    expect(result).toEqual(mockData);
  });

  it('queryFn throws on supabase error', async () => {
    mockChain.limit.mockResolvedValueOnce({ data: null, error: new Error('Notification error') });
    useNotifications();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    await expect(config.queryFn()).rejects.toThrow('Notification error');
  });
});

describe('useUnreadCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChain.select.mockReturnThis();
    mockChain.eq.mockReturnThis();
    mockChain.is.mockResolvedValue({ count: 0, error: null });
    (useQuery as jest.Mock).mockReturnValue({ data: 0, isLoading: false });
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ user: { id: 'u1' }, session: { access_token: 'tok' } });
  });

  it('queries with unread key', () => {
    useUnreadCount();
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['notifications', 'unread', 'u1'] })
    );
  });

  it('has refetchInterval', () => {
    useUnreadCount();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    expect(config.refetchInterval).toBe(30000);
  });

  it('returns 0 when no user', async () => {
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ user: null, session: null });
    useUnreadCount();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(result).toBe(0);
  });

  it('queryFn fetches unread count from supabase', async () => {
    mockChain.is.mockResolvedValueOnce({ count: 3, error: null });
    useUnreadCount();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
    expect(mockChain.select).toHaveBeenCalledWith('id', { count: 'exact', head: true });
    expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(mockChain.is).toHaveBeenCalledWith('read_at', null);
    expect(result).toBe(3);
  });

  it('queryFn returns 0 when count is null', async () => {
    mockChain.is.mockResolvedValueOnce({ count: null, error: null });
    useUnreadCount();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(result).toBe(0);
  });

  it('queryFn throws on supabase error', async () => {
    mockChain.is.mockResolvedValueOnce({ count: null, error: new Error('Count error') });
    useUnreadCount();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    await expect(config.queryFn()).rejects.toThrow('Count error');
  });
});

describe('useMarkNotificationsRead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFunctionsInvoke.mockResolvedValue({ data: {}, error: null });
    (useMutation as jest.Mock).mockReturnValue({ mutate: jest.fn() });
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries: jest.fn() });
  });

  it('calls useMutation', () => {
    useMarkNotificationsRead();
    expect(useMutation).toHaveBeenCalled();
  });

  it('onSuccess invalidates notifications', () => {
    const mockInvalidate = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries: mockInvalidate });
    useMarkNotificationsRead();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    config.onSuccess();
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ['notifications'] });
  });

  it('mutationFn calls supabase functions.invoke', async () => {
    useMarkNotificationsRead();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    await config.mutationFn(['n1', 'n2']);
    expect(mockFunctionsInvoke).toHaveBeenCalledWith('mark-notifications-read', {
      body: { notification_ids: ['n1', 'n2'] },
      headers: { Authorization: 'Bearer tok' },
    });
  });

  it('mutationFn throws on error', async () => {
    mockFunctionsInvoke.mockResolvedValueOnce({ data: null, error: new Error('Invoke failed') });
    useMarkNotificationsRead();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    await expect(config.mutationFn(['n1'])).rejects.toThrow('Invoke failed');
  });

  it('mutationFn returns data on success', async () => {
    mockFunctionsInvoke.mockResolvedValueOnce({ data: { marked: 2 }, error: null });
    useMarkNotificationsRead();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    const result = await config.mutationFn(['n1', 'n2']);
    expect(result).toEqual({ marked: 2 });
  });
});
