import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { asyncStoragePersister } from "@/services/query-persister";
import { logger } from "@/utils/logger";
import { CRMProvider } from "@/providers/CRMProvider";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { validateEnv } from "@/config/env";
import { useAuthGuard } from "@/hooks/useAuthGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Lazy-load OfflineBanner to avoid NetInfo blocking startup on web
let OfflineBanner: React.ComponentType | null = null;
if (Platform.OS !== "web") {
  try {
    OfflineBanner = require("@/components/OfflineBanner").OfflineBanner;
  } catch {}
}

function AppContent() {
  const { colors, isDark } = useTheme();
  useAuthGuard();

  useEffect(() => {
    try {
      validateEnv();
    } catch (e) {
      logger.warn("Env validation failed:", e);
    }
  }, []);

  useEffect(() => {
    let restoring = true;
    let persistTimer: ReturnType<typeof setTimeout> | null = null;

    // Restore persisted query cache
    asyncStoragePersister.restoreClient().then((cache: unknown) => {
      if (cache && typeof cache === 'object' && cache !== null) {
        const state = cache as { clientState?: { queries?: Array<{ queryKey: unknown[]; state: { data: unknown } }> } };
        if (state.clientState?.queries) {
          for (const q of state.clientState.queries) {
            if (q.queryKey && q.state?.data !== undefined) {
              queryClient.setQueryData(q.queryKey, q.state.data);
            }
          }
        }
      }
    }).finally(() => {
      restoring = false;
    });

    // Subscribe to cache changes and persist (debounced, skip during restore)
    const unsub = queryClient.getQueryCache().subscribe(() => {
      if (restoring) return;
      if (persistTimer) clearTimeout(persistTimer);
      persistTimer = setTimeout(() => {
        const queries = queryClient.getQueryCache().getAll()
          .filter(q => q.state.status === 'success' && q.state.data !== undefined)
          .map(q => ({ queryKey: q.queryKey, state: { data: q.state.data } }));
        asyncStoragePersister.persistClient({ clientState: { queries } });
      }, 2000);
    });

    return () => {
      unsub();
      if (persistTimer) clearTimeout(persistTimer);
    };
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.primary },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      {OfflineBanner && <OfflineBanner />}
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CRMProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </CRMProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
