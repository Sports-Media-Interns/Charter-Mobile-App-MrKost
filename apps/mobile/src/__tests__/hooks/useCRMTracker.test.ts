import { renderHook, act } from '@testing-library/react-native';

const mockTrackScreenView = jest.fn();
const mockTrackButtonClick = jest.fn();
const mockTrackFormSubmit = jest.fn();
const mockTrackFormAbandon = jest.fn();
const mockTrackEvent = jest.fn();
const mockTrackError = jest.fn();

const mockService = {
  trackScreenView: mockTrackScreenView,
  trackButtonClick: mockTrackButtonClick,
  trackFormSubmit: mockTrackFormSubmit,
  trackFormAbandon: mockTrackFormAbandon,
  trackEvent: mockTrackEvent,
  trackError: mockTrackError,
};

let mockPathname = '/';
jest.mock('expo-router', () => ({
  usePathname: jest.fn(() => mockPathname),
}));

jest.mock('@/services/crm', () => ({
  CRMService: {
    isInitialized: jest.fn().mockReturnValue(true),
    getInstance: jest.fn(() => mockService),
  },
}));

jest.mock('@/store/crmStore', () => ({
  useCRMStore: jest.fn(() => ({ isInitialized: true })),
}));

jest.mock('@/config/crm', () => ({
  getCRMConfig: jest.fn().mockReturnValue({ enabled: true }),
}));

import { useCRMTracker, useCRMFormTracker } from '@/hooks/useCRMTracker';

describe('useCRMTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname = '/';
  });

  it('returns tracking functions', () => {
    const { result } = renderHook(() => useCRMTracker());
    expect(typeof result.current.trackEvent).toBe('function');
    expect(typeof result.current.trackButtonClick).toBe('function');
    expect(typeof result.current.trackFormSubmit).toBe('function');
    expect(typeof result.current.trackFormAbandon).toBe('function');
    expect(typeof result.current.trackCustomEvent).toBe('function');
    expect(typeof result.current.trackError).toBe('function');
  });

  it('returns current screen name', () => {
    mockPathname = '/settings/billing';
    const { result } = renderHook(() => useCRMTracker());
    expect(result.current.currentScreen).toBe('Settings > Billing');
  });

  it('tracks screen view on pathname change', () => {
    mockPathname = '/home';
    renderHook(() => useCRMTracker());
    expect(mockTrackScreenView).toHaveBeenCalledWith('Home');
  });

  it('does not re-track same pathname', () => {
    mockPathname = '/home';
    const { rerender } = renderHook(() => useCRMTracker());
    mockTrackScreenView.mockClear();
    rerender({});
    expect(mockTrackScreenView).not.toHaveBeenCalled();
  });

  it('trackButtonClick calls service', async () => {
    const { result } = renderHook(() => useCRMTracker());
    await act(async () => {
      await result.current.trackButtonClick('Submit');
    });
    expect(mockTrackButtonClick).toHaveBeenCalledWith('Submit', 'Home');
  });

  it('trackFormSubmit calls service', async () => {
    const { result } = renderHook(() => useCRMTracker());
    await act(async () => {
      await result.current.trackFormSubmit('LoginForm', { email: 'test' });
    });
    expect(mockTrackFormSubmit).toHaveBeenCalledWith('LoginForm', { email: 'test' });
  });

  it('trackFormAbandon calls service', async () => {
    const { result } = renderHook(() => useCRMTracker());
    await act(async () => {
      await result.current.trackFormAbandon('LoginForm', 2);
    });
    expect(mockTrackFormAbandon).toHaveBeenCalledWith('LoginForm', 2);
  });

  it('trackCustomEvent calls service', async () => {
    const { result } = renderHook(() => useCRMTracker());
    await act(async () => {
      await result.current.trackCustomEvent('button_clicked', { foo: 'bar' });
    });
    expect(mockTrackEvent).toHaveBeenCalled();
  });

  it('trackError calls service', async () => {
    const { result } = renderHook(() => useCRMTracker());
    await act(async () => {
      await result.current.trackError('oops', 'ERR1');
    });
    expect(mockTrackError).toHaveBeenCalledWith('oops', 'ERR1', 'Home');
  });

  it('does nothing when CRM not initialized', () => {
    const { useCRMStore } = require('@/store/crmStore');
    useCRMStore.mockReturnValue({ isInitialized: false });
    mockTrackScreenView.mockClear();
    mockPathname = '/new-page';
    renderHook(() => useCRMTracker());
    expect(mockTrackScreenView).not.toHaveBeenCalled();
  });

  it('handles getInstance throwing gracefully', () => {
    const { CRMService } = require('@/services/crm');
    CRMService.getInstance.mockImplementation(() => { throw new Error('no instance'); });
    mockPathname = '/new-route';
    renderHook(() => useCRMTracker());
    // Should not throw, trackScreenView should not be called
    expect(mockTrackScreenView).not.toHaveBeenCalled();
    CRMService.getInstance.mockImplementation(() => mockService);
  });

  it('trackEvent does nothing when service unavailable', async () => {
    const { CRMService } = require('@/services/crm');
    CRMService.getInstance.mockImplementation(() => { throw new Error('no instance'); });
    const { result } = renderHook(() => useCRMTracker());
    // Test trackEvent directly (lines 53-61)
    await act(async () => {
      await result.current.trackEvent('button_clicked');
    });
    expect(mockTrackEvent).not.toHaveBeenCalled();
    // Also test trackCustomEvent
    await act(async () => {
      await result.current.trackCustomEvent('test_event');
    });
    expect(mockTrackEvent).not.toHaveBeenCalled();
    CRMService.getInstance.mockImplementation(() => mockService);
  });

  it('does nothing when CRM disabled', async () => {
    const { getCRMConfig } = require('@/config/crm');
    getCRMConfig.mockReturnValue({ enabled: false });
    const { result } = renderHook(() => useCRMTracker());
    await act(async () => {
      await result.current.trackButtonClick('btn');
    });
    expect(mockTrackButtonClick).not.toHaveBeenCalled();
    getCRMConfig.mockReturnValue({ enabled: true });
  });

  it('formats route groups correctly', () => {
    mockPathname = '/(tabs)/requests';
    const { result } = renderHook(() => useCRMTracker());
    expect(result.current.currentScreen).toBe('Tabs > Requests');
  });

  it('formats dynamic segments', () => {
    mockPathname = '/booking/[id]';
    const { result } = renderHook(() => useCRMTracker());
    expect(result.current.currentScreen).toBe('Booking > :id');
  });

  it('returns Home for root path', () => {
    mockPathname = '/';
    const { result } = renderHook(() => useCRMTracker());
    expect(result.current.currentScreen).toBe('Home');
  });
});

describe('useCRMFormTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks
    const { useCRMStore } = require('@/store/crmStore');
    useCRMStore.mockReturnValue({ isInitialized: true });
    const { getCRMConfig } = require('@/config/crm');
    getCRMConfig.mockReturnValue({ enabled: true });
  });

  it('returns form tracking functions', () => {
    const { result } = renderHook(() => useCRMFormTracker('TestForm'));
    expect(typeof result.current.setCurrentStep).toBe('function');
    expect(typeof result.current.onSubmit).toBe('function');
    expect(typeof result.current.onAbandon).toBe('function');
    expect(typeof result.current.onFieldInteraction).toBe('function');
  });

  it('onSubmit tracks with duration', async () => {
    const { result } = renderHook(() => useCRMFormTracker('TestForm'));
    await act(async () => {
      await result.current.onSubmit({ count: 1 });
    });
    expect(mockTrackFormSubmit).toHaveBeenCalledWith(
      'TestForm',
      expect.objectContaining({ count: 1, durationMs: expect.any(Number), finalStep: 1 })
    );
  });

  it('onAbandon tracks with step', async () => {
    const { result } = renderHook(() => useCRMFormTracker('TestForm'));
    await act(async () => {
      result.current.setCurrentStep(3);
      await result.current.onAbandon();
    });
    expect(mockTrackFormAbandon).toHaveBeenCalledWith('TestForm', 3);
  });

  it('onFieldInteraction tracks button click', async () => {
    const { result } = renderHook(() => useCRMFormTracker('TestForm'));
    await act(async () => {
      await result.current.onFieldInteraction('email');
    });
    expect(mockTrackButtonClick).toHaveBeenCalledWith('TestForm_email_interaction', expect.anything());
  });
});
