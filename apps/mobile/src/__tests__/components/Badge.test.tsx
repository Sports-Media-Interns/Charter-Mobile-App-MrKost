import React from 'react';
import { Badge, StatusBadge } from '@/components/Badge';
import { render } from '@testing-library/react-native';

describe('Badge', () => {
  it('renders label text', () => {
    const { getByText } = render(<Badge label="New" />);
    expect(getByText('New')).toBeOnTheScreen();
  });

  it('renders default variant', () => {
    const { getByText } = render(<Badge label="Default" variant="default" />);
    expect(getByText('Default')).toBeOnTheScreen();
  });

  it('renders primary variant', () => {
    const { getByText } = render(<Badge label="Primary" variant="primary" />);
    expect(getByText('Primary')).toBeOnTheScreen();
  });

  it('renders success variant', () => {
    const { getByText } = render(<Badge label="Success" variant="success" />);
    expect(getByText('Success')).toBeOnTheScreen();
  });

  it('renders warning variant', () => {
    const { getByText } = render(<Badge label="Warning" variant="warning" />);
    expect(getByText('Warning')).toBeOnTheScreen();
  });

  it('renders error variant', () => {
    const { getByText } = render(<Badge label="Error" variant="error" />);
    expect(getByText('Error')).toBeOnTheScreen();
  });

  it('renders info variant', () => {
    const { getByText } = render(<Badge label="Info" variant="info" />);
    expect(getByText('Info')).toBeOnTheScreen();
  });

  it('renders sm size', () => {
    const { getByText } = render(<Badge label="Small" size="sm" />);
    expect(getByText('Small')).toBeOnTheScreen();
  });

  it('renders lg size', () => {
    const { getByText } = render(<Badge label="Large" size="lg" />);
    expect(getByText('Large')).toBeOnTheScreen();
  });

  it('renders outlined mode', () => {
    const { getByText } = render(<Badge label="Outlined" outlined />);
    expect(getByText('Outlined')).toBeOnTheScreen();
  });

  it('renders with icon', () => {
    const { getByText } = render(<Badge label="With Icon" icon="checkmark" />);
    expect(getByText('With Icon')).toBeOnTheScreen();
  });

  it('applies custom style', () => {
    const { getByText } = render(<Badge label="Styled" style={{ margin: 5 }} />);
    expect(getByText('Styled')).toBeOnTheScreen();
  });

  it('renders secondary variant', () => {
    const { getByText } = render(<Badge label="Secondary" variant="secondary" />);
    expect(getByText('Secondary')).toBeOnTheScreen();
  });
});

describe('StatusBadge', () => {
  it('renders draft status', () => {
    const { getByText } = render(<StatusBadge status="draft" />);
    expect(getByText('Draft')).toBeOnTheScreen();
  });

  it('renders submitted status', () => {
    const { getByText } = render(<StatusBadge status="submitted" />);
    expect(getByText('Submitted')).toBeOnTheScreen();
  });

  it('renders booked status', () => {
    const { getByText } = render(<StatusBadge status="booked" />);
    expect(getByText('Booked')).toBeOnTheScreen();
  });

  it('renders cancelled status', () => {
    const { getByText } = render(<StatusBadge status="cancelled" />);
    expect(getByText('Cancelled')).toBeOnTheScreen();
  });

  it('renders unknown status as-is', () => {
    const { getByText } = render(<StatusBadge status="custom_status" />);
    expect(getByText('custom_status')).toBeOnTheScreen();
  });

  it('renders with custom size', () => {
    const { getByText } = render(<StatusBadge status="pending" size="lg" />);
    expect(getByText('Pending')).toBeOnTheScreen();
  });

  it('renders completed status', () => {
    const { getByText } = render(<StatusBadge status="completed" />);
    expect(getByText('Completed')).toBeOnTheScreen();
  });

  it('renders in_progress status', () => {
    const { getByText } = render(<StatusBadge status="in_progress" />);
    expect(getByText('In Progress')).toBeOnTheScreen();
  });
});
