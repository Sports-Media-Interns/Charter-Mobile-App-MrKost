import React from 'react';
import { render } from '@testing-library/react-native';
import { Animated } from 'react-native';

jest.mock('@/theme', () => ({
  typography: { fontSize: { sm: 14 }, fontWeight: { medium: '500' } },
  spacing: { 2: 8, 4: 16 },
}));

const mockUseNetworkStatus = jest.fn().mockReturnValue({ isOffline: false });
jest.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => mockUseNetworkStatus(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 44, bottom: 34, left: 0, right: 0 })),
}));

import { OfflineBanner } from '@/components/OfflineBanner';

describe('OfflineBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNetworkStatus.mockReturnValue({ isOffline: false });
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<OfflineBanner />);
    expect(toJSON()).not.toBeNull();
  });

  it('shows banner text', () => {
    const { getByText } = render(<OfflineBanner />);
    expect(getByText('No internet connection')).toBeOnTheScreen();
  });

  it('animates when offline', () => {
    const springSpy = jest.spyOn(Animated, 'spring');
    mockUseNetworkStatus.mockReturnValue({ isOffline: true });
    render(<OfflineBanner />);
    expect(springSpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ toValue: 0 })
    );
    springSpy.mockRestore();
  });

  it('animates away when online', () => {
    const springSpy = jest.spyOn(Animated, 'spring');
    mockUseNetworkStatus.mockReturnValue({ isOffline: false });
    render(<OfflineBanner />);
    expect(springSpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ toValue: -60 })
    );
    springSpy.mockRestore();
  });

  it('uses safe area insets for positioning', () => {
    const { useSafeAreaInsets } = require('react-native-safe-area-context');
    useSafeAreaInsets.mockReturnValue({ top: 50, bottom: 0, left: 0, right: 0 });
    const { toJSON } = render(<OfflineBanner />);
    const tree = JSON.stringify(toJSON());
    // Verify the safe area inset top value is used
    expect(tree).toContain('50');
  });

  it('uses native driver for animation', () => {
    const springSpy = jest.spyOn(Animated, 'spring');
    render(<OfflineBanner />);
    expect(springSpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ useNativeDriver: true })
    );
    springSpy.mockRestore();
  });

  it('renders with red background', () => {
    const { toJSON } = render(<OfflineBanner />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('#EF4444');
  });

  it('renders cloud-offline icon', () => {
    const { toJSON } = render(<OfflineBanner />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('cloud-offline-outline');
  });
});
