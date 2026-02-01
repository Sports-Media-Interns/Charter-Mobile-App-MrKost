import { renderHook } from '@testing-library/react-native';
import { useQueryClient } from '@tanstack/react-query';

const mockOn = jest.fn().mockReturnThis();
const mockSubscribe = jest.fn().mockReturnThis();
const mockChannel = { on: mockOn, subscribe: mockSubscribe, unsubscribe: jest.fn() };

jest.mock('@/services/supabase', () => ({
  supabase: {
    channel: jest.fn(() => mockChannel),
    removeChannel: jest.fn(),
  },
}));

import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

describe('useRealtimeSubscription', () => {
  const mockInvalidate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries: mockInvalidate });
  });

  it('subscribes to channel when enabled', () => {
    const { supabase } = require('@/services/supabase');
    renderHook(() =>
      useRealtimeSubscription({
        table: 'bookings',
        queryKeys: [['bookings']],
      })
    );
    expect(supabase.channel).toHaveBeenCalled();
    expect(mockOn).toHaveBeenCalled();
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it('does not subscribe when disabled', () => {
    const { supabase } = require('@/services/supabase');
    supabase.channel.mockClear();
    renderHook(() =>
      useRealtimeSubscription({
        table: 'bookings',
        queryKeys: [['bookings']],
        enabled: false,
      })
    );
    expect(supabase.channel).not.toHaveBeenCalled();
  });

  it('removes channel on unmount', () => {
    const { supabase } = require('@/services/supabase');
    const { unmount } = renderHook(() =>
      useRealtimeSubscription({
        table: 'bookings',
        queryKeys: [['bookings']],
      })
    );
    unmount();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });

  it('passes filter when provided', () => {
    renderHook(() =>
      useRealtimeSubscription({
        table: 'bookings',
        filter: 'organization_id=eq.org1',
        queryKeys: [['bookings']],
      })
    );
    expect(mockOn).toHaveBeenCalled();
  });

  it('uses custom event type', () => {
    renderHook(() =>
      useRealtimeSubscription({
        table: 'bookings',
        event: 'INSERT',
        queryKeys: [['bookings']],
      })
    );
    expect(mockOn).toHaveBeenCalled();
  });

  it('invalidates all provided queryKeys on change', () => {
    renderHook(() =>
      useRealtimeSubscription({
        table: 'bookings',
        queryKeys: [['bookings'], ['bookings', 'upcoming']],
      })
    );
    // Get the callback passed to .on() and invoke it
    const onCallback = mockOn.mock.calls[0][2];
    onCallback();
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ['bookings'] });
    expect(mockInvalidate).toHaveBeenCalledWith({ queryKey: ['bookings', 'upcoming'] });
  });

  it('creates channel with correct name', () => {
    const { supabase } = require('@/services/supabase');
    renderHook(() =>
      useRealtimeSubscription({
        table: 'notifications',
        filter: 'user_id=eq.u1',
        queryKeys: [['notifications']],
      })
    );
    expect(supabase.channel).toHaveBeenCalledWith('realtime:notifications:user_id=eq.u1');
  });

  it('uses all for channel name when no filter', () => {
    const { supabase } = require('@/services/supabase');
    renderHook(() =>
      useRealtimeSubscription({
        table: 'bookings',
        queryKeys: [['bookings']],
      })
    );
    expect(supabase.channel).toHaveBeenCalledWith('realtime:bookings:all');
  });
});
