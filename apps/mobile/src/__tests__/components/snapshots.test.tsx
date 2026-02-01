import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// Mock all external dependencies
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('@/theme', () => ({
  colors: {
    primary: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#1E3A5F', 600: '#163353' },
    neutral: { 0: '#fff', 50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626' },
    secondary: { 100: '#e0f2fe', 500: '#0ea5e9', 700: '#0369a1' },
    accent: { 100: '#D1FAE5', 500: '#10B981', 700: '#047857' },
    text: { primary: '#171717', secondary: '#737373', inverse: '#fff' },
    border: { light: '#e5e5e5', medium: '#d4d4d4' },
    background: { primary: '#fff', secondary: '#fafafa' },
    error: '#EF4444',
    success: '#22C55E',
    warning: '#F59E0B',
  },
  borderRadius: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
  typography: {
    fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30 },
    fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
  },
  spacing: { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 },
  shadows: { sm: {}, md: {}, lg: {} },
}));

jest.mock('@/theme/darkColors', () => ({
  darkColors: {},
}));

jest.mock('@/store/themeStore', () => ({
  useThemeStore: jest.fn((selector) => {
    const state = { isDarkMode: false, toggleTheme: jest.fn() };
    return selector(state);
  }),
}));

// Import components
import { Button } from '@/components/Button';
import { Badge, StatusBadge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';

describe('Component Snapshots', () => {
  it('Button renders correctly', () => {
    const { toJSON } = render(<Button title="Press Me" onPress={() => {}} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('Button variant=outline renders correctly', () => {
    const { toJSON } = render(<Button title="Outline" variant="outline" onPress={() => {}} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('Button disabled renders correctly', () => {
    const { toJSON } = render(<Button title="Disabled" disabled onPress={() => {}} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('Button loading renders correctly', () => {
    const { toJSON } = render(<Button title="Loading" loading onPress={() => {}} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('Badge renders correctly', () => {
    const { toJSON } = render(<Badge label="New" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('Badge with color renders correctly', () => {
    const { toJSON } = render(<Badge label="Active" color="#22C55E" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('StatusBadge renders correctly', () => {
    const { toJSON } = render(<StatusBadge status="submitted" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('EmptyState renders correctly', () => {
    const { toJSON } = render(
      <EmptyState
        icon="airplane-outline"
        title="No flights"
        message="You have no flights yet"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('EmptyState with action renders correctly', () => {
    const { toJSON } = render(
      <EmptyState
        icon="add-circle-outline"
        title="No requests"
        message="Create your first request"
        actionLabel="New Request"
        onAction={() => {}}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('LoadingSpinner renders correctly', () => {
    const { toJSON } = render(<LoadingSpinner />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('LoadingSpinner with message renders correctly', () => {
    const { toJSON } = render(<LoadingSpinner message="Loading data..." />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('LoadingSpinner large renders correctly', () => {
    const { toJSON } = render(<LoadingSpinner size="large" />);
    expect(toJSON()).toMatchSnapshot();
  });
});
