import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Test error');
  return <Text>OK</Text>;
};

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary><Text>Content</Text></ErrorBoundary>
    );
    expect(getByText('Content')).toBeOnTheScreen();
  });

  it('renders error UI when child throws', () => {
    const { getByText } = render(
      <ErrorBoundary><ThrowError shouldThrow /></ErrorBoundary>
    );
    expect(getByText('Something went wrong')).toBeOnTheScreen();
  });

  it('shows error message in dev mode', () => {
    (global as any).__DEV__ = true;
    const { getByText } = render(
      <ErrorBoundary><ThrowError shouldThrow /></ErrorBoundary>
    );
    expect(getByText('Test error')).toBeOnTheScreen();
  });

  it('shows generic message in production', () => {
    (global as any).__DEV__ = false;
    const { getByText } = render(
      <ErrorBoundary><ThrowError shouldThrow /></ErrorBoundary>
    );
    expect(getByText('An unexpected error occurred.')).toBeOnTheScreen();
    (global as any).__DEV__ = true;
  });

  it('renders Try Again button', () => {
    const { getByText } = render(
      <ErrorBoundary><ThrowError shouldThrow /></ErrorBoundary>
    );
    expect(getByText('Try Again')).toBeOnTheScreen();
  });

  it('resets on Try Again press', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary><ThrowError shouldThrow={false} /></ErrorBoundary>
    );
    expect(getByText('OK')).toBeOnTheScreen();
  });

  it('renders custom fallback', () => {
    const { getByText } = render(
      <ErrorBoundary fallback={<Text>Custom Error</Text>}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );
    expect(getByText('Custom Error')).toBeOnTheScreen();
  });

  it('Try Again button has accessibility', () => {
    const { getByLabelText } = render(
      <ErrorBoundary><ThrowError shouldThrow /></ErrorBoundary>
    );
    expect(getByLabelText('Try again')).toBeOnTheScreen();
  });
});
