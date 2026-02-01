import { useQuery } from '@tanstack/react-query';

jest.mock('@/store', () => ({
  useAuthStore: jest.fn(() => ({
    profile: { id: 'u1', organization_id: 'org1' },
  })),
}));

jest.mock('@/services/supabase', () => {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    order: jest.fn(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
  };
  // order is sometimes terminal (useBookings), sometimes chained (useUpcomingBookings)
  chain.order.mockImplementation(() => {
    const obj = {
      ...chain,
      then: (resolve: any) => Promise.resolve(chain._terminalResult || { data: [], error: null }).then(resolve),
    };
    return obj;
  });
  return {
    supabase: { from: jest.fn(() => chain) },
    _chain: chain,
  };
});

const { supabase: mockSupabase, _chain: mockChain } = require('@/services/supabase');

import { useBookings, useBooking, useUpcomingBookings } from '@/hooks/useBookings';

describe('useBookings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChain.select.mockReturnThis();
    mockChain.eq.mockReturnThis();
    mockChain.in.mockReturnThis();
    mockChain._terminalResult = { data: [], error: null };
    mockChain.single.mockResolvedValue({ data: null, error: null });
    mockChain.limit.mockResolvedValue({ data: [], error: null });
    mockChain.order.mockImplementation(() => {
      const obj = {
        ...mockChain,
        then: (resolve: any) => Promise.resolve(mockChain._terminalResult).then(resolve),
      };
      return obj;
    });
    (useQuery as jest.Mock).mockReturnValue({ data: [], isLoading: false, error: null });
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ profile: { id: 'u1', organization_id: 'org1' } });
  });

  it('calls useQuery with bookings key', () => {
    useBookings();
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['bookings', 'org1'] })
    );
  });

  it('enabled when org exists', () => {
    useBookings();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    expect(config.enabled).toBe(true);
  });

  it('returns empty array when no org', async () => {
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ profile: { organization_id: null } });
    useBookings();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(result).toEqual([]);
  });

  it('queryFn fetches bookings from supabase', async () => {
    const mockData = [{ id: 'b1', status: 'confirmed' }];
    mockChain._terminalResult = { data: mockData, error: null };
    useBookings();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(mockSupabase.from).toHaveBeenCalledWith('bookings');
    expect(mockChain.select).toHaveBeenCalledWith(expect.stringContaining('id'));
    expect(mockChain.eq).toHaveBeenCalledWith('organization_id', 'org1');
    expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toEqual(mockData);
  });

  it('queryFn throws on supabase error', async () => {
    mockChain._terminalResult = { data: null, error: new Error('DB error') };
    useBookings();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    await expect(config.queryFn()).rejects.toThrow('DB error');
  });
});

describe('useBooking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChain.select.mockReturnThis();
    mockChain.eq.mockReturnThis();
    mockChain.single.mockResolvedValue({ data: null, error: null });
    (useQuery as jest.Mock).mockReturnValue({ data: null, isLoading: false });
  });

  it('calls useQuery with booking id', () => {
    useBooking('b1');
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['booking', 'b1'], enabled: true })
    );
  });

  it('disabled when id empty', () => {
    useBooking('');
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    expect(config.enabled).toBe(false);
  });

  it('queryFn fetches single booking', async () => {
    const mockData = { id: 'b1', status: 'confirmed', quote: {} };
    mockChain.single.mockResolvedValueOnce({ data: mockData, error: null });
    useBooking('b1');
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(mockSupabase.from).toHaveBeenCalledWith('bookings');
    expect(mockChain.select).toHaveBeenCalledWith(expect.stringContaining('*'));
    expect(mockChain.eq).toHaveBeenCalledWith('id', 'b1');
    expect(mockChain.single).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it('queryFn throws on supabase error', async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: new Error('Not found') });
    useBooking('b1');
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    await expect(config.queryFn()).rejects.toThrow('Not found');
  });
});

describe('useUpcomingBookings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChain.select.mockReturnThis();
    mockChain.eq.mockReturnThis();
    mockChain.in.mockReturnThis();
    mockChain._terminalResult = { data: [], error: null };
    mockChain.limit.mockResolvedValue({ data: [], error: null });
    mockChain.order.mockImplementation(() => {
      const obj = {
        ...mockChain,
        then: (resolve: any) => Promise.resolve(mockChain._terminalResult).then(resolve),
      };
      return obj;
    });
    (useQuery as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ profile: { id: 'u1', organization_id: 'org1' } });
  });

  it('calls useQuery with upcoming key', () => {
    useUpcomingBookings();
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['bookings', 'upcoming', 'org1'] })
    );
  });

  it('returns empty when no org', async () => {
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ profile: { organization_id: null } });
    useUpcomingBookings();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(result).toEqual([]);
  });

  it('queryFn fetches upcoming bookings with filters', async () => {
    const mockData = [{ id: 'b2', status: 'confirmed' }];
    mockChain.limit.mockResolvedValueOnce({ data: mockData, error: null });
    useUpcomingBookings();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(mockSupabase.from).toHaveBeenCalledWith('bookings');
    expect(mockChain.eq).toHaveBeenCalledWith('organization_id', 'org1');
    expect(mockChain.in).toHaveBeenCalledWith('status', ['confirmed', 'in_progress']);
    expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toEqual(mockData);
  });

  it('queryFn throws on supabase error', async () => {
    mockChain.limit.mockResolvedValueOnce({ data: null, error: new Error('Upcoming error') });
    useUpcomingBookings();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    await expect(config.queryFn()).rejects.toThrow('Upcoming error');
  });
});
