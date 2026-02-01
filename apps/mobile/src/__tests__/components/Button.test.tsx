import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Button } from '@/components/Button';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Button', () => {
  it('renders title text', () => {
    const { getByText } = renderWithTheme(
      <Button title="Submit" onPress={() => {}} />,
    );
    expect(getByText('Submit')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Button title="Click me" onPress={onPress} />,
    );
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <Button title="Disabled" onPress={onPress} disabled />,
    );
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { queryByText } = renderWithTheme(
      <Button title="Loading" onPress={() => {}} loading />,
    );
    expect(queryByText('Loading')).toBeNull();
  });

  it('has correct accessibility role', () => {
    const { getByRole } = renderWithTheme(
      <Button title="Accessible" onPress={() => {}} />,
    );
    expect(getByRole('button')).toBeTruthy();
  });
});
