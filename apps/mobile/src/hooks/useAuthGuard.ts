import { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store';

export function useAuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, setSession, setProfile, setLoading } = useAuthStore();
  const signingOut = useRef(false);

  useEffect(() => {
    // Get initial session so we don't spin forever
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Prevent re-entrant signOut loop
        if (signingOut.current) return;

        setSession(session);

        if (event === 'SIGNED_OUT' || !session) {
          setLoading(false);
          return;
        }

        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            setProfile(profile);
          } catch {
            // Profile fetch failed, continue without it
          }
        }

        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // Use a ref to track the previous segment to avoid array reference issues
  const firstSegment = segments[0];

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = firstSegment === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, firstSegment]);
}
