import { renderHook, act } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

describe('useNetworkStatus', () => {
  let listeners: ((state: any) => void)[] = [];

  beforeEach(() => {
    listeners = [];
    (NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
      listeners.push(cb);
      return jest.fn();
    });
  });

  it('defaults to connected', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('subscribes to NetInfo on mount', () => {
    renderHook(() => useNetworkStatus());
    expect(NetInfo.addEventListener).toHaveBeenCalled();
  });

  it('updates when connection changes', () => {
    const { result } = renderHook(() => useNetworkStatus());
    act(() => {
      listeners[0]({ isConnected: false, type: 'none' });
    });
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });

  it('updates connectionType', () => {
    const { result } = renderHook(() => useNetworkStatus());
    act(() => {
      listeners[0]({ isConnected: true, type: 'wifi' });
    });
    expect(result.current.connectionType).toBe('wifi');
  });

  it('unsubscribes on unmount', () => {
    const unsubscribe = jest.fn();
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubscribe);
    const { unmount } = renderHook(() => useNetworkStatus());
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('handles cellular connection', () => {
    const { result } = renderHook(() => useNetworkStatus());
    act(() => {
      listeners[0]({ isConnected: true, type: 'cellular' });
    });
    expect(result.current.connectionType).toBe('cellular');
    expect(result.current.isConnected).toBe(true);
  });

  it('handles null isConnected', () => {
    const { result } = renderHook(() => useNetworkStatus());
    act(() => {
      listeners[0]({ isConnected: null, type: 'unknown' });
    });
    expect(result.current.isConnected).toBeNull();
    expect(result.current.isOffline).toBe(false);
  });

  it('isOffline only true when isConnected is false', () => {
    const { result } = renderHook(() => useNetworkStatus());
    // null case
    act(() => {
      listeners[0]({ isConnected: null, type: 'unknown' });
    });
    expect(result.current.isOffline).toBe(false);
    // false case
    act(() => {
      listeners[0]({ isConnected: false, type: 'none' });
    });
    expect(result.current.isOffline).toBe(true);
  });
});
