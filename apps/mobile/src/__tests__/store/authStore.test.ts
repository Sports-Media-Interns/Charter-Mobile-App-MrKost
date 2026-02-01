import { useAuthStore } from '@/store/authStore';
import { createMockSession, createMockUser } from '../test-utils';

// Mock supabase module
jest.mock('@/services/supabase', () => ({
  supabase: {
    auth: { signOut: jest.fn() },
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      session: null,
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
    });
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.isLoading).toBe(true);
    expect(state.isAuthenticated).toBe(false);
  });

  it('setSession sets session and user', () => {
    const session = createMockSession();
    useAuthStore.getState().setSession(session as any);
    const state = useAuthStore.getState();
    expect(state.session).toBe(session);
    expect(state.user).toBe(session.user);
    expect(state.isAuthenticated).toBe(true);
  });

  it('setSession with null clears auth', () => {
    const session = createMockSession();
    useAuthStore.getState().setSession(session as any);
    useAuthStore.getState().setSession(null);
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setProfile sets profile', () => {
    const profile = createMockUser();
    useAuthStore.getState().setProfile(profile as any);
    expect(useAuthStore.getState().profile).toBe(profile);
  });

  it('setLoading updates isLoading', () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('signOut clears all state', () => {
    const session = createMockSession();
    useAuthStore.getState().setSession(session as any);
    useAuthStore.getState().setProfile(createMockUser() as any);
    useAuthStore.getState().signOut();
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('signOut calls supabase signOut', () => {
    const { supabase } = require('@/services/supabase');
    useAuthStore.getState().signOut();
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('setProfile with null clears profile', () => {
    useAuthStore.getState().setProfile(createMockUser() as any);
    useAuthStore.getState().setProfile(null);
    expect(useAuthStore.getState().profile).toBeNull();
  });

  it('multiple setSession calls update correctly', () => {
    const s1 = createMockSession();
    const s2 = createMockSession({ access_token: 'token-2' });
    useAuthStore.getState().setSession(s1 as any);
    useAuthStore.getState().setSession(s2 as any);
    expect(useAuthStore.getState().session).toBe(s2);
  });

  it('setLoading to true', () => {
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
  });

  it('isAuthenticated is false after signOut even if session was set', () => {
    useAuthStore.getState().setSession(createMockSession() as any);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    useAuthStore.getState().signOut();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('user is derived from session', () => {
    const session = createMockSession();
    useAuthStore.getState().setSession(session as any);
    expect(useAuthStore.getState().user?.email).toBe('test@example.com');
  });
});
