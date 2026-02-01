import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { ThemeToggle } from '@/components/ThemeToggle';
import { renderWithTheme } from '../test-utils';

describe('ThemeToggle', () => {
  it('renders toggle button', () => {
    const { getByLabelText } = renderWithTheme(<ThemeToggle />);
    expect(getByLabelText('Toggle dark mode')).toBeOnTheScreen();
  });

  it('has button accessibility role', () => {
    const { getByRole } = renderWithTheme(<ThemeToggle />);
    expect(getByRole('button')).toBeOnTheScreen();
  });

  it('renders with custom color', () => {
    const { getByLabelText } = renderWithTheme(<ThemeToggle color="#FF0000" />);
    expect(getByLabelText('Toggle dark mode')).toBeOnTheScreen();
  });

  it('renders with custom size', () => {
    const { getByLabelText } = renderWithTheme(<ThemeToggle size={30} />);
    expect(getByLabelText('Toggle dark mode')).toBeOnTheScreen();
  });

  it('is pressable', () => {
    const { getByLabelText } = renderWithTheme(<ThemeToggle />);
    fireEvent.press(getByLabelText('Toggle dark mode'));
    // Should not throw
  });

  it('renders with default props', () => {
    const { getByLabelText } = renderWithTheme(<ThemeToggle />);
    expect(getByLabelText('Toggle dark mode')).toBeOnTheScreen();
  });
});
