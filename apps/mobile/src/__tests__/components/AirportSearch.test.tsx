import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

jest.mock('@/theme', () => ({
  colors: {
    primary: { 50: '#f0f9ff', 500: '#1E3A5F' },
    neutral: { 0: '#fff', 100: '#f5f5f5', 300: '#d4d4d4', 400: '#a3a3a3', 500: '#737373', 600: '#525252' },
    secondary: { 100: '#e0f2fe', 700: '#0369a1' },
    text: { primary: '#171717', secondary: '#737373' },
    border: { light: '#e5e5e5' },
    background: { secondary: '#fafafa' },
    error: '#EF4444',
  },
  borderRadius: { sm: 4, lg: 12, full: 9999 },
  typography: { fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20 }, fontWeight: { medium: '500', semibold: '600', bold: '700' } },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 },
  shadows: { sm: {} },
}));

jest.mock('@/data/airports', () => ({
  searchAirports: jest.fn(() => [
    { icao: 'KJFK', iata: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', state: 'NY', country: 'USA', lat: 40.6, lon: -73.7, type: 'large' },
  ]),
  formatAirportDisplay: jest.fn((a: any) => `${a.iata} - ${a.city}`),
}));

import { AirportSearch } from '@/components/AirportSearch';

describe('AirportSearch', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with label', () => {
    const { getByText } = render(
      <AirportSearch label="Departure" onChange={mockOnChange} />
    );
    expect(getByText('Departure')).toBeOnTheScreen();
  });

  it('renders placeholder when no value', () => {
    const { getByText } = render(
      <AirportSearch placeholder="Pick airport" onChange={mockOnChange} />
    );
    expect(getByText('Pick airport')).toBeOnTheScreen();
  });

  it('renders selected airport', () => {
    const airport = { icao: 'KJFK', iata: 'JFK', name: 'JFK', city: 'New York', state: 'NY', country: 'USA', lat: 40, lon: -73, type: 'large' as const };
    const { getByText } = render(
      <AirportSearch value={airport} onChange={mockOnChange} />
    );
    expect(getByText('JFK')).toBeOnTheScreen();
    expect(getByText('New York, NY')).toBeOnTheScreen();
  });

  it('shows error message', () => {
    const { getByText } = render(
      <AirportSearch error="Required" onChange={mockOnChange} />
    );
    expect(getByText('Required')).toBeOnTheScreen();
  });

  it('opens modal on press', () => {
    const { getByText, getByRole } = render(
      <AirportSearch label="Departure" onChange={mockOnChange} />
    );
    // The selector is a touchable
    fireEvent.press(getByText('Search airports...'));
    expect(getByText('Select Airport')).toBeOnTheScreen();
  });

  it('closes modal via close button', () => {
    const { getByText, queryByText, getByLabelText } = render(
      <AirportSearch label="Departure" onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Search airports...'));
    expect(getByText('Select Airport')).toBeOnTheScreen();
    // The close icon renders with accessibilityLabel="close" via our Ionicons mock
    fireEvent.press(getByLabelText('close'));
    expect(queryByText('Select Airport')).toBeNull();
  });

  it('does not open when disabled', () => {
    const { getByText, queryByText } = render(
      <AirportSearch disabled onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Search airports...'));
    expect(queryByText('Select Airport')).toBeNull();
  });

  it('shows empty state for short queries', () => {
    const { getByText } = render(
      <AirportSearch onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Search airports...'));
    expect(getByText('Search for an airport')).toBeOnTheScreen();
  });

  it('searches and shows results', () => {
    const { searchAirports } = require('@/data/airports');
    const { getByText, getByPlaceholderText } = render(
      <AirportSearch onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Search airports...'));
    const input = getByPlaceholderText('Search by code, city, or name...');
    fireEvent.changeText(input, 'JFK');
    expect(searchAirports).toHaveBeenCalledWith('JFK', 15, 'all');
  });

  it('selects airport from results', () => {
    const { getByText, getByPlaceholderText } = render(
      <AirportSearch onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Search airports...'));
    fireEvent.changeText(getByPlaceholderText('Search by code, city, or name...'), 'JFK');
    // Result item
    fireEvent.press(getByText('John F. Kennedy International Airport'));
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ iata: 'JFK' }));
  });

  it('clears selection', () => {
    const airport = { icao: 'KJFK', iata: 'JFK', name: 'JFK', city: 'New York', state: 'NY', country: 'USA', lat: 40, lon: -73, type: 'large' as const };
    const { getByLabelText } = render(
      <AirportSearch value={airport} onChange={mockOnChange} />
    );
    // The clear button renders an Ionicons close-circle icon
    fireEvent.press(getByLabelText('close-circle'));
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('shows no results state', () => {
    const { searchAirports } = require('@/data/airports');
    searchAirports.mockReturnValue([]);
    const { getByText, getByPlaceholderText } = render(
      <AirportSearch onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Search airports...'));
    fireEvent.changeText(getByPlaceholderText('Search by code, city, or name...'), 'ZZZZZZ');
    expect(getByText('No airports found')).toBeOnTheScreen();
  });

  it('shows footer with result count', () => {
    const { searchAirports } = require('@/data/airports');
    searchAirports.mockReturnValue([
      { icao: 'KJFK', iata: 'JFK', name: 'JFK', city: 'New York', state: 'NY', country: 'USA', lat: 40, lon: -73, type: 'large' },
    ]);
    const { getByText, getByPlaceholderText } = render(
      <AirportSearch onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Search airports...'));
    fireEvent.changeText(getByPlaceholderText('Search by code, city, or name...'), 'JFK');
    expect(getByText('1 airport found')).toBeOnTheScreen();
  });

  it('renders with default placeholder', () => {
    const { getByText } = render(<AirportSearch onChange={mockOnChange} />);
    expect(getByText('Search airports...')).toBeOnTheScreen();
  });

  it('renders filter tabs in modal', () => {
    const { getByText } = render(<AirportSearch onChange={mockOnChange} />);
    fireEvent.press(getByText('Search airports...'));
    expect(getByText('All')).toBeOnTheScreen();
    expect(getByText('Airport Code')).toBeOnTheScreen();
    expect(getByText('City')).toBeOnTheScreen();
    expect(getByText('Airport Name')).toBeOnTheScreen();
  });

  it('changes filter and re-searches', () => {
    const { searchAirports } = require('@/data/airports');
    const { getByText, getByPlaceholderText } = render(
      <AirportSearch onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Search airports...'));
    fireEvent.changeText(getByPlaceholderText('Search by code, city, or name...'), 'JFK');
    searchAirports.mockClear();
    fireEvent.press(getByText('Airport Code'));
    expect(searchAirports).toHaveBeenCalledWith('JFK', 15, 'code');
  });

  it('shows private badge for private airports', () => {
    const { searchAirports } = require('@/data/airports');
    searchAirports.mockReturnValue([
      { icao: 'KTEB', iata: 'TEB', name: 'Teterboro Airport', city: 'Teterboro', state: 'NJ', country: 'USA', lat: 40, lon: -74, type: 'private' },
    ]);
    const { getByText, getByPlaceholderText } = render(
      <AirportSearch onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Search airports...'));
    fireEvent.changeText(getByPlaceholderText('Search by code, city, or name...'), 'TEB');
    expect(getByText('Private')).toBeOnTheScreen();
  });

  it('clears search results when query becomes short', () => {
    const { searchAirports } = require('@/data/airports');
    searchAirports.mockReturnValue([
      { icao: 'KJFK', iata: 'JFK', name: 'JFK Airport', city: 'New York', state: 'NY', country: 'USA', lat: 40, lon: -73, type: 'large' },
    ]);
    const { getByText, getByPlaceholderText } = render(
      <AirportSearch onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Search airports...'));
    const input = getByPlaceholderText('Search by code, city, or name...');
    fireEvent.changeText(input, 'JFK');
    expect(getByText('JFK Airport')).toBeOnTheScreen();
    // Clear by typing empty string (simulates clear button calling handleSearch(''))
    fireEvent.changeText(input, '');
    expect(getByText('Search for an airport')).toBeOnTheScreen();
  });

  it('shows empty results when search returns nothing', () => {
    const { searchAirports } = require('@/data/airports');
    searchAirports.mockReturnValue([]);
    const { getByText, getByPlaceholderText } = render(
      <AirportSearch onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Search airports...'));
    fireEvent.changeText(getByPlaceholderText('Search by code, city, or name...'), 'XY');
    expect(getByText('No airports found')).toBeOnTheScreen();
  });

  it('renders international airport location without state', () => {
    const { searchAirports } = require('@/data/airports');
    searchAirports.mockReturnValue([
      { icao: 'EGLL', iata: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', lat: 51, lon: 0, type: 'large' },
    ]);
    const { getByText, getByPlaceholderText } = render(
      <AirportSearch onChange={mockOnChange} />
    );
    fireEvent.press(getByText('Search airports...'));
    fireEvent.changeText(getByPlaceholderText('Search by code, city, or name...'), 'LHR');
    expect(getByText('London, United Kingdom')).toBeOnTheScreen();
  });
});
