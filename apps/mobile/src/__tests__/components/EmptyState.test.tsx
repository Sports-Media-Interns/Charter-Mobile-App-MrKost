import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { EmptyState } from '@/components/EmptyState';
import { renderWithTheme } from '../test-utils';

describe('EmptyState', () => {
  it('renders title', () => {
    const { getByText } = renderWithTheme(<EmptyState icon="airplane" title="No flights" />);
    expect(getByText('No flights')).toBeOnTheScreen();
  });

  it('renders description', () => {
    const { getByText } = renderWithTheme(
      <EmptyState icon="airplane" title="No flights" description="Try searching" />
    );
    expect(getByText('Try searching')).toBeOnTheScreen();
  });

  it('renders without description', () => {
    const { queryByText } = renderWithTheme(<EmptyState icon="airplane" title="No flights" />);
    expect(queryByText('Try searching')).toBeNull();
  });

  it('renders action button', () => {
    const onAction = jest.fn();
    const { getByText } = renderWithTheme(
      <EmptyState icon="airplane" title="No flights" actionLabel="Add Flight" onAction={onAction} />
    );
    expect(getByText('Add Flight')).toBeOnTheScreen();
  });

  it('calls onAction when button pressed', () => {
    const onAction = jest.fn();
    const { getByText } = renderWithTheme(
      <EmptyState icon="airplane" title="No flights" actionLabel="Add" onAction={onAction} />
    );
    fireEvent.press(getByText('Add'));
    expect(onAction).toHaveBeenCalled();
  });

  it('does not render button without onAction', () => {
    const { queryByText } = renderWithTheme(
      <EmptyState icon="airplane" title="No flights" actionLabel="Add" />
    );
    expect(queryByText('Add')).toBeNull();
  });
});
