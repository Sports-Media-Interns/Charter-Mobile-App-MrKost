import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { FlightCard } from '@/components/FlightCard';
import { renderWithTheme } from '../test-utils';

describe('FlightCard', () => {
  const defaultProps = {
    departure: 'LAX',
    arrival: 'JFK',
    date: 'Jun 15, 2024',
  };

  it('renders departure and arrival codes', () => {
    const { getByText } = renderWithTheme(<FlightCard {...defaultProps} />);
    expect(getByText('LAX')).toBeOnTheScreen();
    expect(getByText('JFK')).toBeOnTheScreen();
  });

  it('renders date', () => {
    const { getByText } = renderWithTheme(<FlightCard {...defaultProps} />);
    expect(getByText('Jun 15, 2024')).toBeOnTheScreen();
  });

  it('renders time when provided', () => {
    const { getByText } = renderWithTheme(<FlightCard {...defaultProps} time="9:00 AM" />);
    expect(getByText('9:00 AM')).toBeOnTheScreen();
  });

  it('renders passengers', () => {
    const { getByText } = renderWithTheme(<FlightCard {...defaultProps} passengers={10} />);
    expect(getByText('10 pax')).toBeOnTheScreen();
  });

  it('renders status badge', () => {
    const { getByText } = renderWithTheme(<FlightCard {...defaultProps} status="booked" />);
    expect(getByText('Booked')).toBeOnTheScreen();
  });

  it('renders aircraft', () => {
    const { getByText } = renderWithTheme(<FlightCard {...defaultProps} aircraft="Gulfstream G550" />);
    expect(getByText('Gulfstream G550')).toBeOnTheScreen();
  });

  it('renders price', () => {
    const { getByText } = renderWithTheme(<FlightCard {...defaultProps} price={25000} />);
    expect(getByText('$25,000')).toBeOnTheScreen();
  });

  it('handles onPress', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithTheme(<FlightCard {...defaultProps} onPress={onPress} />);
    fireEvent.press(getByLabelText('Flight from LAX to JFK'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders as View without onPress', () => {
    const { getByText } = renderWithTheme(<FlightCard {...defaultProps} />);
    expect(getByText('LAX')).toBeOnTheScreen();
  });

  it('has correct accessibility label', () => {
    const { getByLabelText } = renderWithTheme(<FlightCard {...defaultProps} onPress={() => {}} />);
    expect(getByLabelText('Flight from LAX to JFK')).toBeOnTheScreen();
  });
});
