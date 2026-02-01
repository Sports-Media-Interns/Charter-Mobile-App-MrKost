import { useQuery } from '@tanstack/react-query';

jest.mock('@/store', () => ({
  useAuthStore: jest.fn(() => ({
    profile: { id: 'u1', organization_id: 'org1' },
  })),
}));

jest.mock('@/services/supabase', () => {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    order: jest.fn().mockResolvedValue({ data: [], error: null }),
  };
  return {
    supabase: { from: jest.fn(() => chain) },
    _chain: chain,
  };
});

const { supabase: mockSupabase, _chain: mockChain } = require('@/services/supabase');

import { useInvoices, usePaymentTransactions } from '@/hooks/useBilling';

describe('useInvoices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChain.select.mockReturnThis();
    mockChain.eq.mockReturnThis();
    mockChain.order.mockResolvedValue({ data: [], error: null });
    (useQuery as jest.Mock).mockReturnValue({ data: [], isLoading: false });
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ profile: { id: 'u1', organization_id: 'org1' } });
  });

  it('calls useQuery with invoices key', () => {
    useInvoices();
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['invoices', 'org1'] })
    );
  });

  it('enabled when org exists', () => {
    useInvoices();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    expect(config.enabled).toBe(true);
  });

  it('returns empty when no org', async () => {
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ profile: { organization_id: null } });
    useInvoices();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(result).toEqual([]);
  });

  it('disabled when no org', () => {
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ profile: { organization_id: null } });
    useInvoices();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    expect(config.enabled).toBe(false);
  });

  it('queryFn fetches invoices from supabase', async () => {
    const mockData = [{ id: 'inv-1', invoice_number: 'INV001', amount: 5000 }];
    mockChain.order.mockResolvedValueOnce({ data: mockData, error: null });
    useInvoices();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(mockSupabase.from).toHaveBeenCalledWith('invoices');
    expect(mockChain.select).toHaveBeenCalledWith(expect.stringContaining('id'));
    expect(mockChain.eq).toHaveBeenCalledWith('organization_id', 'org1');
    expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toEqual(mockData);
  });

  it('queryFn throws on supabase error', async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: new Error('Invoice DB error') });
    useInvoices();
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    await expect(config.queryFn()).rejects.toThrow('Invoice DB error');
  });
});

describe('usePaymentTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChain.select.mockReturnThis();
    mockChain.eq.mockReturnThis();
    mockChain.order.mockResolvedValue({ data: [], error: null });
    (useQuery as jest.Mock).mockReturnValue({ data: [], isLoading: false });
  });

  it('calls useQuery with transactions key', () => {
    usePaymentTransactions('b1');
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['transactions', 'b1'] })
    );
  });

  it('enabled when bookingId provided', () => {
    usePaymentTransactions('b1');
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    expect(config.enabled).toBe(true);
  });

  it('disabled when no bookingId', () => {
    usePaymentTransactions(undefined);
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    expect(config.enabled).toBe(false);
  });

  it('returns empty when no bookingId', async () => {
    usePaymentTransactions(undefined);
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(result).toEqual([]);
  });

  it('queryFn fetches transactions from supabase', async () => {
    const mockData = [{ id: 'tx-1', amount: 2500 }];
    mockChain.order.mockResolvedValueOnce({ data: mockData, error: null });
    usePaymentTransactions('b1');
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await config.queryFn();
    expect(mockSupabase.from).toHaveBeenCalledWith('payment_transactions');
    expect(mockChain.select).toHaveBeenCalledWith('*');
    expect(mockChain.eq).toHaveBeenCalledWith('booking_id', 'b1');
    expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toEqual(mockData);
  });

  it('queryFn throws on supabase error', async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: new Error('Transaction error') });
    usePaymentTransactions('b1');
    const config = (useQuery as jest.Mock).mock.calls[0][0];
    await expect(config.queryFn()).rejects.toThrow('Transaction error');
  });
});
