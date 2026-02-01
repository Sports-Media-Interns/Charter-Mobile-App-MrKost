import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppState } from 'react-native';

// Mock dependencies
const mockGetCRMConfig = jest.fn().mockReturnValue({ apiBaseUrl: 'https://test.com', apiKey: '', enabled: true });
const mockIsCRMEnabled = jest.fn().mockReturnValue(true);
jest.mock('@/config/crm', () => ({
  getCRMConfig: () => mockGetCRMConfig(),
  isCRMEnabled: () => mockIsCRMEnabled(),
}));

const mockService = {
  initialize: jest.fn().mockResolvedValue(undefined),
  identifyUser: jest.fn().mockResolvedValue('c1'),
  getSyncStatus: jest.fn().mockReturnValue({ isOnline: true, queueLength: 0, errors: [] }),
  getQueueLength: jest.fn().mockReturnValue(0),
  forceSync: jest.fn().mockResolvedValue(undefined),
  trackEvent: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@/services/crm', () => ({
  CRMService: {
    getInstance: jest.fn(() => mockService),
    destroyInstance: jest.fn(),
    isInitialized: jest.fn().mockReturnValue(true),
  },
}));

const mockCRMStore = {
  isInitialized: false,
  isOnline: true,
  queueLength: 0,
  setInitialized: jest.fn(),
  setOnline: jest.fn(),
  setQueueLength: jest.fn(),
  setCurrentContactId: jest.fn(),
  updateSyncStatus: jest.fn(),
};

jest.mock('@/store/crmStore', () => ({
  useCRMStore: jest.fn(() => mockCRMStore),
}));

jest.mock('@/store/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    profile: { id: 'u1', email: 'test@test.com', full_name: 'Test' },
  })),
}));

import { CRMProvider, useCRM } from '@/providers/CRMProvider';

function TestConsumer() {
  const crm = useCRM();
  return <Text testID="crm-status">{JSON.stringify(crm)}</Text>;
}

describe('CRMProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCRMStore.isInitialized = false;
  });

  it('renders children', () => {
    const { getByText } = render(
      <CRMProvider><Text>Child</Text></CRMProvider>
    );
    expect(getByText('Child')).toBeOnTheScreen();
  });

  it('provides CRM context values', () => {
    let value: any;
    function Consumer() {
      value = useCRM();
      return null;
    }
    render(<CRMProvider><Consumer /></CRMProvider>);
    expect(value).toHaveProperty('isEnabled');
    expect(value).toHaveProperty('isInitialized');
    expect(value).toHaveProperty('isOnline');
    expect(value).toHaveProperty('queueLength');
  });

  it('initializes CRM service when enabled', async () => {
    render(<CRMProvider><Text>test</Text></CRMProvider>);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(mockService.initialize).toHaveBeenCalled();
  });

  it('does not initialize when disabled', async () => {
    mockIsCRMEnabled.mockReturnValue(false);
    mockService.initialize.mockClear();
    render(<CRMProvider><Text>test</Text></CRMProvider>);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(mockService.initialize).not.toHaveBeenCalled();
    mockIsCRMEnabled.mockReturnValue(true);
  });

  it('sets initialized on success', async () => {
    render(<CRMProvider><Text>test</Text></CRMProvider>);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(mockCRMStore.setInitialized).toHaveBeenCalledWith(true);
  });

  it('handles init failure gracefully', async () => {
    mockService.initialize.mockRejectedValueOnce(new Error('fail'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    render(<CRMProvider><Text>test</Text></CRMProvider>);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(mockCRMStore.setInitialized).toHaveBeenCalledWith(false);
    warnSpy.mockRestore();
  });

  it('identifies user when profile available and initialized', async () => {
    mockCRMStore.isInitialized = true;
    render(<CRMProvider><Text>test</Text></CRMProvider>);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    expect(mockService.identifyUser).toHaveBeenCalled();
  });

  it('forceSync is available in context', () => {
    let crmRef: any;
    function Capture() {
      crmRef = useCRM();
      return null;
    }
    render(<CRMProvider><Capture /></CRMProvider>);
    expect(typeof crmRef.forceSync).toBe('function');
  });

  it('tracks app state changes to active', async () => {
    mockCRMStore.isInitialized = true;
    // Capture the AppState listener
    let appStateCallback: any;
    const mockRemove = jest.fn();
    jest.spyOn(AppState, 'addEventListener').mockImplementation((event: string, callback: any) => {
      appStateCallback = callback;
      return { remove: mockRemove } as any;
    });

    render(<CRMProvider><Text>test</Text></CRMProvider>);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    // Simulate app going to foreground
    if (appStateCallback) {
      await act(async () => {
        await appStateCallback('active');
      });
      expect(mockService.trackEvent).toHaveBeenCalledWith('app_foregrounded');
      expect(mockService.forceSync).toHaveBeenCalled();
    }
  });

  it('tracks app state changes to background', async () => {
    mockCRMStore.isInitialized = true;
    let appStateCallback: any;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((event: string, callback: any) => {
      appStateCallback = callback;
      return { remove: jest.fn() } as any;
    });

    render(<CRMProvider><Text>test</Text></CRMProvider>);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    if (appStateCallback) {
      await act(async () => {
        await appStateCallback('background');
      });
      expect(mockService.trackEvent).toHaveBeenCalledWith('app_backgrounded');
    }
  });

  it('removes AppState listener on unmount', async () => {
    mockCRMStore.isInitialized = true;
    const mockRemove = jest.fn();
    jest.spyOn(AppState, 'addEventListener').mockImplementation(() => {
      return { remove: mockRemove } as any;
    });

    const { unmount } = render(<CRMProvider><Text>test</Text></CRMProvider>);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    unmount();
    expect(mockRemove).toHaveBeenCalled();
  });

  it('handles app state tracking error gracefully', async () => {
    mockCRMStore.isInitialized = true;
    mockService.trackEvent.mockRejectedValueOnce(new Error('track fail'));
    let appStateCallback: any;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((event: string, callback: any) => {
      appStateCallback = callback;
      return { remove: jest.fn() } as any;
    });
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<CRMProvider><Text>test</Text></CRMProvider>);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    if (appStateCallback) {
      await act(async () => {
        await appStateCallback('active');
      });
    }
    warnSpy.mockRestore();
  });

  it('periodic status update runs when initialized', async () => {
    jest.useFakeTimers();
    mockCRMStore.isInitialized = true;

    render(<CRMProvider><Text>test</Text></CRMProvider>);

    // Advance timer past the 10s interval
    act(() => {
      jest.advanceTimersByTime(11000);
    });

    expect(mockService.getSyncStatus).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('handles identifyUser failure gracefully', async () => {
    mockCRMStore.isInitialized = true;
    mockService.identifyUser.mockRejectedValueOnce(new Error('identify fail'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    render(<CRMProvider><Text>test</Text></CRMProvider>);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    warnSpy.mockRestore();
    // Should not throw - renders normally
  });

  it('forceSync handles error gracefully', async () => {
    mockCRMStore.isInitialized = true;
    mockService.forceSync.mockRejectedValueOnce(new Error('sync fail'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    let crmRef: any;
    function Capture() {
      crmRef = useCRM();
      return null;
    }
    render(<CRMProvider><Capture /></CRMProvider>);
    await act(async () => {
      await crmRef.forceSync();
    });
    warnSpy.mockRestore();
    // Should not throw
  });

  it('forceSync calls service and updates status when initialized', async () => {
    mockCRMStore.isInitialized = true;
    let crmRef: any;
    function Capture() {
      crmRef = useCRM();
      return null;
    }
    render(<CRMProvider><Capture /></CRMProvider>);

    // forceSync should work since isInitialized=true and isEnabled=true
    await act(async () => {
      await crmRef.forceSync();
    });
    expect(mockService.forceSync).toHaveBeenCalled();
    expect(mockCRMStore.updateSyncStatus).toHaveBeenCalled();
  });
});

describe('useCRM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCRMStore.isInitialized = false;
  });

  it('returns context value', () => {
    let value: any;
    function Consumer() {
      value = useCRM();
      return null;
    }
    render(<CRMProvider><Consumer /></CRMProvider>);
    expect(value).toHaveProperty('isEnabled');
    expect(value).toHaveProperty('isInitialized');
    expect(value).toHaveProperty('isOnline');
    expect(value).toHaveProperty('queueLength');
    expect(value).toHaveProperty('forceSync');
  });

  it('returns default values when used outside provider', () => {
    let value: any;
    function Orphan() {
      value = useCRM();
      return null;
    }
    render(<Orphan />);
    // Default context value
    expect(value.isEnabled).toBe(false);
    expect(value.isInitialized).toBe(false);
    expect(typeof value.forceSync).toBe('function');
  });
});
