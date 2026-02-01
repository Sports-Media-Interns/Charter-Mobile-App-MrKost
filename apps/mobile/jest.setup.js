// Jest setup file
import "@testing-library/jest-native/extend-expect";

// Mock expo modules
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock Supabase
jest.mock("@supabase/supabase-js", () => {
  const mockAuth = {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    resetPasswordForEmail: jest.fn(),
  };
  const mockFrom = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  }));
  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
    unsubscribe: jest.fn(),
  };
  return {
    createClient: jest.fn(() => ({
      auth: mockAuth,
      from: mockFrom,
      channel: jest.fn(() => mockChannel),
      removeChannel: jest.fn(),
      functions: {
        invoke: jest.fn().mockResolvedValue({ data: {}, error: null }),
      },
    })),
  };
});

// Mock NetInfo
jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, type: "wifi" })),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  })),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useSegments: jest.fn(() => []),
  useLocalSearchParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => "/"),
  useRootNavigationState: jest.fn(() => ({ key: "root", routeNames: [] })),
  Link: "Link",
  Redirect: "Redirect",
}));

// Mock react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
}));

// Mock @tanstack/react-query
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false, error: null })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
  QueryClientProvider: ({ children }) => children,
}));

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" },
}), { virtual: true });

// Mock @expo/vector-icons globally to prevent act() warnings from async Icon state updates
jest.mock("@expo/vector-icons", () => {
  const { View, Text } = require("react-native");
  return {
    Ionicons: (props) => {
      const React = require("react");
      return React.createElement(Text, { accessibilityLabel: props.name }, props.name);
    },
  };
});

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
  }),
);

// Set __DEV__
global.__DEV__ = true;
