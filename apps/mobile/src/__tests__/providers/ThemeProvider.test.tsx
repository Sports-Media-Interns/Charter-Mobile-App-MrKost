import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';
import { useThemeStore } from '@/store/themeStore';

function TestConsumer() {
  const { colors, isDark, toggle } = useTheme();
  return (
    <>
      <Text testID="isDark">{isDark ? 'dark' : 'light'}</Text>
      <Text testID="bgColor">{colors.background.primary}</Text>
      <Text testID="toggle" onPress={toggle}>Toggle</Text>
    </>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    useThemeStore.setState({ isDarkMode: false });
  });

  it('provides light theme by default', () => {
    const { getByTestId } = render(
      <ThemeProvider><TestConsumer /></ThemeProvider>
    );
    expect(getByTestId('isDark').props.children).toBe('light');
  });

  it('provides colors', () => {
    const { getByTestId } = render(
      <ThemeProvider><TestConsumer /></ThemeProvider>
    );
    expect(typeof getByTestId('bgColor').props.children).toBe('string');
    expect(getByTestId('bgColor').props.children).toMatch(/^#/);
  });

  it('toggle switches to dark mode', () => {
    const { getByTestId } = render(
      <ThemeProvider><TestConsumer /></ThemeProvider>
    );
    fireEvent.press(getByTestId('toggle'));
    expect(getByTestId('isDark').props.children).toBe('dark');
  });

  it('provides dark colors when dark mode', () => {
    useThemeStore.setState({ isDarkMode: true });
    const { getByTestId } = render(
      <ThemeProvider><TestConsumer /></ThemeProvider>
    );
    expect(getByTestId('isDark').props.children).toBe('dark');
  });

  it('renders children', () => {
    const { getByText } = render(
      <ThemeProvider><Text>Child</Text></ThemeProvider>
    );
    expect(getByText('Child')).toBeOnTheScreen();
  });

  it('useTheme returns default values outside provider', () => {
    const { getByTestId } = render(<TestConsumer />);
    expect(getByTestId('isDark').props.children).toBe('light');
  });

  it('toggle can switch back to light', () => {
    const { getByTestId } = render(
      <ThemeProvider><TestConsumer /></ThemeProvider>
    );
    fireEvent.press(getByTestId('toggle'));
    expect(getByTestId('isDark').props.children).toBe('dark');
    fireEvent.press(getByTestId('toggle'));
    expect(getByTestId('isDark').props.children).toBe('light');
  });

  it('provides different background colors for dark and light', () => {
    const { getByTestId, rerender } = render(
      <ThemeProvider><TestConsumer /></ThemeProvider>
    );
    const lightBg = getByTestId('bgColor').props.children;
    useThemeStore.setState({ isDarkMode: true });
    rerender(<ThemeProvider><TestConsumer /></ThemeProvider>);
    const darkBg = getByTestId('bgColor').props.children;
    expect(lightBg).not.toBe(darkBg);
  });
});
