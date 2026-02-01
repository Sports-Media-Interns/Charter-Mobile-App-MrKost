import React from 'react';
import { LoadingSpinner, SkeletonLoader } from '@/components/LoadingSpinner';
import { renderWithTheme } from '../test-utils';

describe('LoadingSpinner', () => {
  it('renders ActivityIndicator', () => {
    const { UNSAFE_getByType } = renderWithTheme(<LoadingSpinner />);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator).props.size).toBe('large');
  });

  it('renders message', () => {
    const { getByText } = renderWithTheme(<LoadingSpinner message="Loading..." />);
    expect(getByText('Loading...')).toBeOnTheScreen();
  });

  it('renders without message', () => {
    const { queryByText } = renderWithTheme(<LoadingSpinner />);
    expect(queryByText('Loading...')).toBeNull();
  });

  it('renders fullScreen mode', () => {
    const { getByText } = renderWithTheme(<LoadingSpinner fullScreen message="Please wait" />);
    expect(getByText('Please wait')).toBeOnTheScreen();
  });

  it('renders small size ActivityIndicator', () => {
    const { UNSAFE_getByType } = renderWithTheme(<LoadingSpinner size="small" />);
    const { ActivityIndicator } = require('react-native');
    const indicator = UNSAFE_getByType(ActivityIndicator);
    expect(indicator.props.size).toBe('small');
  });
});

describe('SkeletonLoader', () => {
  it('renders with default dimensions', () => {
    const { toJSON } = renderWithTheme(<SkeletonLoader />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"width":"100%"');
    expect(json).toContain('"height":20');
  });

  it('renders with custom dimensions', () => {
    const { toJSON } = renderWithTheme(<SkeletonLoader width={100} height={40} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"width":100');
    expect(json).toContain('"height":40');
  });

  it('renders with custom borderRadius', () => {
    const { toJSON } = renderWithTheme(<SkeletonLoader borderRadius={16} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"borderRadius":16');
  });
});
