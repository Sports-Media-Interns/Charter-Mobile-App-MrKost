import { renderHook, act } from '@testing-library/react-native';

const mockReplace = jest.fn();
const mockUseRouter = jest.fn(() => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }));
const mockUseSegments = jest.fn(() => [] as string[]);

jest.mock('expo-router', () => ({
  useRouter: () => mockUseRouter(),
  useSegments: () => mockUseSegments(),
}));

const mockGetSession = jest.fn().mockResolvedValue({ data: { session: null } });
const mockOnAuthStateChange = jest.fn(() => ({
  data: { subscription: { unsubscribe: jest.fn() } },
}));

jest.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
    })),
  },
}));

const mockSetSession = jest.fn();
const mockSetProfile = jest.fn();
const mockSetLoading = jest.fn();
let mockIsAuthenticated = false;
let mockIsLoading = true;

jest.mock('@/store', () => ({
  useAuthStore: jest.fn(() => ({
    isAuthenticated: mockIsAuthenticated,
    isLoading: mockIsLoading,
    setSession: mockSetSession,
    setProfile: mockSetProfile,
    setLoading: mockSetLoading,
  })),
}));

import { useAuthGuard } from '@/hooks/useAuthGuard';

describe('useAuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated = false;
    mockIsLoading = true;
  });

  it('calls getSession on mount', () => {
    renderHook(() => useAuthGuard());
    expect(mockGetSession).toHaveBeenCalled();
  });

  it('sets up onAuthStateChange listener', () => {
    renderHook(() => useAuthGuard());
    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });

  it('calls setLoading(false) after getSession resolves', async () => {
    renderHook(() => useAuthGuard());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('redirects to login when not authenticated and not in auth group', () => {
    mockIsLoading = false;
    mockIsAuthenticated = false;
    mockUseSegments.mockReturnValue(['(tabs)']);
    renderHook(() => useAuthGuard());
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('redirects to tabs when authenticated and in auth group', () => {
    mockIsLoading = false;
    mockIsAuthenticated = true;
    mockUseSegments.mockReturnValue(['(auth)']);
    renderHook(() => useAuthGuard());
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
  });

  it('does not redirect while loading', () => {
    mockIsLoading = true;
    renderHook(() => useAuthGuard());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not redirect when authenticated and in tabs', () => {
    mockIsLoading = false;
    mockIsAuthenticated = true;
    mockUseSegments.mockReturnValue(['(tabs)']);
    renderHook(() => useAuthGuard());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not redirect when not authenticated and in auth group', () => {
    mockIsLoading = false;
    mockIsAuthenticated = false;
    mockUseSegments.mockReturnValue(['(auth)']);
    renderHook(() => useAuthGuard());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('handles getSession failure', async () => {
    mockGetSession.mockRejectedValueOnce(new Error('fail'));
    renderHook(() => useAuthGuard());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('unsubscribes on unmount', () => {
    const unsub = jest.fn();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: unsub } },
    });
    const { unmount } = renderHook(() => useAuthGuard());
    unmount();
    expect(unsub).toHaveBeenCalled();
  });

  it('sets session from getSession result', async () => {
    const mockSession = { user: { id: 'u1' }, access_token: 'tok' };
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    renderHook(() => useAuthGuard());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(mockSetSession).toHaveBeenCalledWith(mockSession);
  });

  it('onAuthStateChange SIGNED_OUT sets loading false', async () => {
    let authCallback: any;
    mockOnAuthStateChange.mockImplementation((cb: any) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    renderHook(() => useAuthGuard());
    await act(async () => {
      await authCallback('SIGNED_OUT', null);
    });
    expect(mockSetSession).toHaveBeenCalledWith(null);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('onAuthStateChange with session fetches profile', async () => {
    let authCallback: any;
    mockOnAuthStateChange.mockImplementation((cb: any) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    const mockProfile = { id: 'u1', full_name: 'Test' };
    const { supabase } = require('@/services/supabase');
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockProfile }),
    });
    renderHook(() => useAuthGuard());
    await act(async () => {
      await authCallback('SIGNED_IN', { user: { id: 'u1' }, access_token: 'tok' });
    });
    expect(mockSetProfile).toHaveBeenCalledWith(mockProfile);
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('onAuthStateChange handles profile fetch failure', async () => {
    let authCallback: any;
    mockOnAuthStateChange.mockImplementation((cb: any) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    const { supabase } = require('@/services/supabase');
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockRejectedValue(new Error('fail')),
    });
    renderHook(() => useAuthGuard());
    await act(async () => {
      await authCallback('SIGNED_IN', { user: { id: 'u1' }, access_token: 'tok' });
    });
    // Should not throw, setLoading still called
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });

  it('onAuthStateChange with no session returns early', async () => {
    let authCallback: any;
    mockOnAuthStateChange.mockImplementation((cb: any) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    renderHook(() => useAuthGuard());
    mockSetProfile.mockClear();
    await act(async () => {
      await authCallback('TOKEN_REFRESHED', null);
    });
    expect(mockSetSession).toHaveBeenCalledWith(null);
    expect(mockSetProfile).not.toHaveBeenCalled();
    expect(mockSetLoading).toHaveBeenCalledWith(false);
  });
});
