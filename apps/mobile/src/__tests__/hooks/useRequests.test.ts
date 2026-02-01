import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

jest.mock('@/store', () => ({
  useAuthStore: jest.fn(() => ({
    profile: { id: 'u1', organization_id: 'org1' },
  })),
}));

jest.mock('@/services/supabase', () => {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
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

const mockCRMService = {
  trackEvent: jest.fn().mockResolvedValue(undefined),
  createRequestOpportunity: jest.fn().mockResolvedValue('opp-1'),
};
jest.mock('@/services/crm', () => ({
  CRMService: {
    isInitialized: jest.fn().mockReturnValue(false),
    getInstance: jest.fn(() => mockCRMService),
  },
}));
jest.mock('@/config/crm', () => ({
  getCRMConfig: jest.fn().mockReturnValue({ enabled: false }),
}));
jest.mock('@/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

import { useRequests, useRequest, useCreateRequest, useCancelRequest } from '@/hooks/useRequests';

describe('useRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChain.select.mockReturnThis();
    mockChain.eq.mockReturnThis();
    mockChain.insert.mockReturnThis();
    mockChain.update.mockReturnThis();
    mockChain.order.mockResolvedValue({ data: [], error: null });
    mockChain.single.mockResolvedValue({ data: null, error: null });
    mockSupabase.from.mockImplementation(() => mockChain);
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ profile: { id: 'u1', organization_id: 'org1' } });
    (useQuery as jest.Mock).mockReturnValue({ data: [], isLoading: false, error: null });
    (useMutation as jest.Mock).mockReturnValue({ mutate: jest.fn(), mutateAsync: jest.fn(), isLoading: false });
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries: jest.fn() });
  });

  it('calls useQuery with requests key', () => {
    useRequests();
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['requests', 'org1'] })
    );
  });

  it('sets enabled based on organization_id', () => {
    useRequests();
    const call = (useQuery as jest.Mock).mock.calls[0][0];
    expect(call.enabled).toBe(true);
  });

  it('queryFn returns empty array when no org', async () => {
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ profile: { id: 'u1', organization_id: null } });
    useRequests();
    const call = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await call.queryFn();
    expect(result).toEqual([]);
  });

  it('queryFn fetches data from supabase when org exists', async () => {
    const mockData = [{ id: 'r1', status: 'submitted' }];
    mockChain.order.mockResolvedValueOnce({ data: mockData, error: null });
    useRequests();
    const call = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await call.queryFn();
    expect(mockSupabase.from).toHaveBeenCalledWith('charter_requests');
    expect(mockChain.select).toHaveBeenCalledWith(expect.stringContaining('id'));
    expect(mockChain.eq).toHaveBeenCalledWith('organization_id', 'org1');
    expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toEqual(mockData);
  });

  it('queryFn throws on supabase error', async () => {
    mockChain.order.mockResolvedValueOnce({ data: null, error: new Error('DB error') });
    useRequests();
    const call = (useQuery as jest.Mock).mock.calls[0][0];
    await expect(call.queryFn()).rejects.toThrow('DB error');
  });
});

describe('useRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChain.select.mockReturnThis();
    mockChain.eq.mockReturnThis();
    mockChain.single.mockResolvedValue({ data: null, error: null });
    (useQuery as jest.Mock).mockReturnValue({ data: null, isLoading: false, error: null });
  });

  it('calls useQuery with request key and id', () => {
    useRequest('req-1');
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['request', 'req-1'], enabled: true })
    );
  });

  it('disabled when id is empty', () => {
    useRequest('');
    const call = (useQuery as jest.Mock).mock.calls[0][0];
    expect(call.enabled).toBe(false);
  });

  it('queryFn fetches single request from supabase', async () => {
    const mockData = { id: 'req-1', status: 'submitted', flight_legs: [] };
    mockChain.single.mockResolvedValueOnce({ data: mockData, error: null });
    useRequest('req-1');
    const call = (useQuery as jest.Mock).mock.calls[0][0];
    const result = await call.queryFn();
    expect(mockSupabase.from).toHaveBeenCalledWith('charter_requests');
    expect(mockChain.select).toHaveBeenCalledWith(expect.stringContaining('*'));
    expect(mockChain.eq).toHaveBeenCalledWith('id', 'req-1');
    expect(mockChain.single).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it('queryFn throws on supabase error', async () => {
    mockChain.single.mockResolvedValueOnce({ data: null, error: new Error('Not found') });
    useRequest('req-1');
    const call = (useQuery as jest.Mock).mock.calls[0][0];
    await expect(call.queryFn()).rejects.toThrow('Not found');
  });
});

describe('useCreateRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ profile: { id: 'u1', organization_id: 'org1' } });
    mockSupabase.from.mockImplementation(() => mockChain);
    (useMutation as jest.Mock).mockReturnValue({ mutate: jest.fn(), mutateAsync: jest.fn() });
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries: jest.fn() });
  });

  it('calls useMutation', () => {
    useCreateRequest();
    expect(useMutation).toHaveBeenCalled();
  });

  it('mutation config has mutationFn and onSuccess', () => {
    useCreateRequest();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    expect(config).toHaveProperty('mutationFn');
    expect(config).toHaveProperty('onSuccess');
  });

  it('mutationFn throws without organization', async () => {
    const { useAuthStore } = require('@/store');
    useAuthStore.mockReturnValue({ profile: { id: 'u1', organization_id: null } });
    useCreateRequest();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    await expect(config.mutationFn({ tripType: 'one_way', passengerCount: 5, urgency: 'standard', legs: [] }))
      .rejects.toThrow('No organization found');
  });

  it('mutationFn inserts request and legs successfully', async () => {
    const mockInsertChain = {
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { id: 'req-new' }, error: null }),
      }),
    };
    const legsInsertResult = { error: null };

    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'charter_requests') {
        return { ...mockChain, insert: jest.fn().mockReturnValue(mockInsertChain) };
      }
      if (table === 'flight_legs') {
        return { insert: jest.fn().mockResolvedValue(legsInsertResult) };
      }
      return mockChain;
    });

    useCreateRequest();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    const result = await config.mutationFn({
      tripType: 'one_way',
      passengerCount: 5,
      urgency: 'standard',
      legs: [
        { departureAirport: 'lax', arrivalAirport: 'jfk', departureDate: '2024-06-15', departureTime: '09:00', flexibilityHours: 2 },
      ],
    });
    expect(result).toEqual({ id: 'req-new' });
    expect(mockSupabase.from).toHaveBeenCalledWith('charter_requests');
    expect(mockSupabase.from).toHaveBeenCalledWith('flight_legs');
  });

  it('mutationFn throws on request insert error', async () => {
    mockSupabase.from.mockImplementation(() => ({
      ...mockChain,
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }),
        }),
      }),
    }));

    useCreateRequest();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    await expect(config.mutationFn({
      tripType: 'one_way', passengerCount: 5, urgency: 'standard', legs: [],
    })).rejects.toThrow('Insert failed');
  });

  it('mutationFn throws on legs insert error', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'charter_requests') {
        return {
          ...mockChain,
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: 'req-new' }, error: null }),
            }),
          }),
        };
      }
      return { insert: jest.fn().mockResolvedValue({ error: new Error('Legs failed') }) };
    });

    useCreateRequest();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    await expect(config.mutationFn({
      tripType: 'one_way', passengerCount: 5, urgency: 'standard',
      legs: [{ departureAirport: 'LAX', arrivalAirport: 'JFK', departureDate: '2024-06-15', departureTime: '09:00', flexibilityHours: 2 }],
    })).rejects.toThrow('Legs failed');
  });

  it('onSuccess invalidates requests and tracks CRM when enabled', async () => {
    const { getCRMConfig } = require('@/config/crm');
    getCRMConfig.mockReturnValue({ enabled: true });
    const { CRMService } = require('@/services/crm');
    CRMService.isInitialized.mockReturnValue(true);

    const mockInvalidate = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries: mockInvalidate });

    useCreateRequest();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    const mockRequest = { id: 'req-new' };
    const mockVariables = { tripType: 'one_way', passengerCount: 5, urgency: 'standard', legs: [{}] };
    await config.onSuccess(mockRequest, mockVariables);

    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ['requests'] });
    expect(mockCRMService.trackEvent).toHaveBeenCalledWith('request_submitted', expect.objectContaining({
      properties: expect.objectContaining({ requestId: 'req-new' }),
    }));
    expect(mockCRMService.createRequestOpportunity).toHaveBeenCalled();
  });

  it('onSuccess handles CRM tracking failure gracefully', async () => {
    const { getCRMConfig } = require('@/config/crm');
    getCRMConfig.mockReturnValue({ enabled: true });
    const { CRMService } = require('@/services/crm');
    CRMService.isInitialized.mockReturnValue(true);
    mockCRMService.trackEvent.mockRejectedValueOnce(new Error('CRM fail'));

    const mockInvalidate = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries: mockInvalidate });

    useCreateRequest();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    await config.onSuccess({ id: 'req-new' }, { tripType: 'one_way', passengerCount: 5, urgency: 'standard', legs: [] });
    expect(mockInvalidate).toHaveBeenCalled();
    const { logger } = require('@/utils/logger');
    expect(logger.warn).toHaveBeenCalled();
  });
});

describe('useCancelRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChain.select.mockReturnThis();
    mockChain.update.mockReturnThis();
    mockChain.eq.mockResolvedValue({ error: null });
    (useMutation as jest.Mock).mockReturnValue({ mutate: jest.fn() });
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries: jest.fn() });
    mockSupabase.from.mockImplementation(() => mockChain);
  });

  it('calls useMutation', () => {
    useCancelRequest();
    expect(useMutation).toHaveBeenCalled();
  });

  it('mutationFn updates status to cancelled', async () => {
    mockChain.eq.mockResolvedValueOnce({ error: null });
    useCancelRequest();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    await config.mutationFn('req-1');
    expect(mockSupabase.from).toHaveBeenCalledWith('charter_requests');
    expect(mockChain.update).toHaveBeenCalledWith({ status: 'cancelled' });
    expect(mockChain.eq).toHaveBeenCalledWith('id', 'req-1');
  });

  it('mutationFn throws on supabase error', async () => {
    mockChain.eq.mockResolvedValueOnce({ error: new Error('Cancel failed') });
    useCancelRequest();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    await expect(config.mutationFn('req-1')).rejects.toThrow('Cancel failed');
  });

  it('onSuccess invalidates queries', () => {
    const mockInvalidate = jest.fn();
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries: mockInvalidate });
    useCancelRequest();
    const config = (useMutation as jest.Mock).mock.calls[0][0];
    config.onSuccess(undefined, 'req-1');
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ['requests'] });
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ['request', 'req-1'] });
  });
});
