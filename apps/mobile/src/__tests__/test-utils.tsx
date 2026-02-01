import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/providers/ThemeProvider';

export function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

export function createMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'test@example.com',
    full_name: 'John Doe',
    phone: '+11234567890',
    role: 'client',
    organization_id: 'org-1',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

export function createMockSession(overrides: Record<string, unknown> = {}) {
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'user-1',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      created_at: '2024-01-01T00:00:00Z',
    },
    ...overrides,
  };
}

export function createMockCharterRequest(overrides: Record<string, unknown> = {}) {
  return {
    id: 'req-1',
    user_id: 'user-1',
    organization_id: 'org-1',
    trip_type: 'round_trip',
    passenger_count: 10,
    urgency: 'standard',
    status: 'submitted',
    special_requirements: '',
    baggage_notes: '',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

export function createMockFlightLeg(overrides: Record<string, unknown> = {}) {
  return {
    departureAirport: 'LAX',
    arrivalAirport: 'JFK',
    departureDate: '2024-06-15',
    departureTime: '09:00',
    flexibilityHours: 2,
    ...overrides,
  };
}

export function createMockCRMEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'evt-1',
    type: 'user_logged_in' as const,
    timestamp: '2024-01-01T00:00:00Z',
    userId: 'user-1',
    properties: {},
    metadata: {},
    ...overrides,
  };
}
