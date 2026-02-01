import {
  userToContact,
  organizationToContact,
  requestToOpportunity,
  eventToActivity,
  generateEventId,
  createCRMEvent,
} from '@/services/crm/CRMDataMapper';
import { createMockUser, createMockCRMEvent } from '../../test-utils';

describe('userToContact', () => {
  it('maps basic user fields', () => {
    const user = createMockUser();
    const contact = userToContact(user as any);
    expect(contact.email).toBe('test@example.com');
    expect(contact.firstName).toBe('John');
    expect(contact.lastName).toBe('Doe');
    expect(contact.source).toBe('sports_media_charter_app');
  });

  it('handles single name', () => {
    const user = createMockUser({ full_name: 'Madonna' });
    const contact = userToContact(user as any);
    expect(contact.firstName).toBe('Madonna');
    expect(contact.lastName).toBe('');
  });

  it('handles empty name', () => {
    const user = createMockUser({ full_name: '' });
    const contact = userToContact(user as any);
    expect(contact.firstName).toBe('');
  });

  it('includes phone', () => {
    const user = createMockUser({ phone: '+11234567890' });
    const contact = userToContact(user as any);
    expect(contact.phone).toBe('+11234567890');
  });

  it('includes organization data', () => {
    const user = createMockUser();
    const contact = userToContact(user as any, { organizationName: 'Acme', organizationType: 'sports_team' });
    expect(contact.companyName).toBe('Acme');
    expect(contact.tags).toContain('org_sports_team');
  });

  it('adds role tag', () => {
    const user = createMockUser({ role: 'admin' });
    const contact = userToContact(user as any);
    expect(contact.tags).toContain('role_admin');
  });

  it('always includes charter_app_user tag', () => {
    const user = createMockUser();
    const contact = userToContact(user as any);
    expect(contact.tags).toContain('charter_app_user');
  });

  it('sets customField with appUserId', () => {
    const user = createMockUser();
    const contact = userToContact(user as any);
    expect(contact.customField?.appUserId).toBe('user-1');
  });
});

describe('organizationToContact', () => {
  it('maps org fields', () => {
    const contact = organizationToContact({ id: 'org-1', name: 'Team X' });
    expect(contact.companyName).toBe('Team X');
    expect(contact.tags).toContain('organization');
  });

  it('generates email when missing', () => {
    const contact = organizationToContact({ id: 'org-1', name: 'Team X' });
    expect(contact.email).toContain('org-org-1@');
  });

  it('uses provided email', () => {
    const contact = organizationToContact({ id: 'org-1', name: 'Team X', email: 'org@test.com' });
    expect(contact.email).toBe('org@test.com');
  });

  it('adds sport tag', () => {
    const contact = organizationToContact({ id: 'org-1', name: 'Team X', sport: 'Ice Hockey' });
    expect(contact.tags).toContain('sport_ice_hockey');
  });

  it('adds org type tag', () => {
    const contact = organizationToContact({ id: 'org-1', name: 'Team X', type: 'sports_team' });
    expect(contact.tags).toContain('org_type_sports_team');
  });
});

describe('requestToOpportunity', () => {
  it('maps basic request', () => {
    const opp = requestToOpportunity({ id: 'req-1', passenger_count: 10, trip_type: 'round_trip' }, 'contact-1');
    expect(opp.contactId).toBe('contact-1');
    expect(opp.title).toContain('Round trip');
    expect(opp.title).toContain('10 passengers');
  });

  it('uses estimated value when provided', () => {
    const opp = requestToOpportunity({ id: 'req-1' }, 'c-1', 50000);
    expect(opp.monetaryValue).toBe(50000);
  });

  it('calculates value with urgency multiplier', () => {
    const standard = requestToOpportunity({ id: 'req-1', urgency: 'standard', passenger_count: 10 }, 'c-1');
    const emergency = requestToOpportunity({ id: 'req-1', urgency: 'emergency', passenger_count: 10 }, 'c-1');
    expect(emergency.monetaryValue!).toBeGreaterThan(standard.monetaryValue!);
  });

  it('marks emergency as urgent in title', () => {
    const opp = requestToOpportunity({ id: 'req-1', urgency: 'emergency', passenger_count: 5 }, 'c-1');
    expect(opp.title).toContain('[URGENT]');
  });

  it('maps booked status to won', () => {
    const opp = requestToOpportunity({ id: 'req-1', status: 'booked' }, 'c-1');
    expect(opp.status).toBe('won');
  });

  it('maps cancelled status to lost', () => {
    const opp = requestToOpportunity({ id: 'req-1', status: 'cancelled' }, 'c-1');
    expect(opp.status).toBe('lost');
  });

  it('maps expired status to abandoned', () => {
    const opp = requestToOpportunity({ id: 'req-1', status: 'expired' }, 'c-1');
    expect(opp.status).toBe('abandoned');
  });

  it('defaults status to open', () => {
    const opp = requestToOpportunity({ id: 'req-1', status: 'submitted' }, 'c-1');
    expect(opp.status).toBe('open');
  });
});

describe('eventToActivity', () => {
  it('includes event type in body', () => {
    const event = createMockCRMEvent({ type: 'user_logged_in' });
    const body = eventToActivity(event as any);
    expect(body).toContain('[user_logged_in]');
  });

  it('includes timestamp', () => {
    const event = createMockCRMEvent();
    const body = eventToActivity(event as any);
    expect(body).toContain('Timestamp:');
  });

  it('describes auth events', () => {
    const event = createMockCRMEvent({ type: 'user_registered' });
    expect(eventToActivity(event as any)).toContain('registered');
  });

  it('includes metadata in details', () => {
    const event = createMockCRMEvent({ type: 'screen_viewed', metadata: { screen: 'Home' } });
    const body = eventToActivity(event as any);
    expect(body).toContain('Home');
  });
});

describe('eventToActivity - all event types', () => {
  it('describes profile_updated with fields', () => {
    const event = createMockCRMEvent({ type: 'profile_updated', properties: { updatedFields: ['name', 'phone'] } });
    expect(eventToActivity(event as any)).toContain('name, phone');
  });

  it('describes request_created with trip info', () => {
    const event = createMockCRMEvent({ type: 'request_created', properties: { tripType: 'round_trip', passengerCount: 10 } });
    const body = eventToActivity(event as any);
    expect(body).toContain('round_trip');
    expect(body).toContain('10 pax');
  });

  it('describes quote_received with price', () => {
    const event = createMockCRMEvent({ type: 'quote_received', properties: { operator: 'JetCo', price: 50000 } });
    const body = eventToActivity(event as any);
    expect(body).toContain('JetCo');
    expect(body).toContain('50,000');
  });

  it('describes payment_completed with amount', () => {
    const event = createMockCRMEvent({ type: 'payment_completed', properties: { amount: 75000 } });
    expect(eventToActivity(event as any)).toContain('75,000');
  });

  it('describes payment_failed with error', () => {
    const event = createMockCRMEvent({ type: 'payment_failed', properties: { error: 'Card declined' } });
    expect(eventToActivity(event as any)).toContain('Card declined');
  });

  it('describes screen_viewed', () => {
    const event = createMockCRMEvent({ type: 'screen_viewed', metadata: { screen: 'Dashboard' } });
    expect(eventToActivity(event as any)).toContain('Dashboard');
  });

  it('describes button_clicked', () => {
    const event = createMockCRMEvent({ type: 'button_clicked', metadata: { action: 'submit', screen: 'Form' } });
    const body = eventToActivity(event as any);
    expect(body).toContain('submit');
    expect(body).toContain('Form');
  });

  it('describes form_submitted', () => {
    const event = createMockCRMEvent({ type: 'form_submitted', metadata: { component: 'LoginForm' } });
    expect(eventToActivity(event as any)).toContain('LoginForm');
  });

  it('describes form_abandoned', () => {
    const event = createMockCRMEvent({ type: 'form_abandoned', metadata: { component: 'RequestForm', value: '2' } });
    expect(eventToActivity(event as any)).toContain('step 2');
  });

  it('describes form_step_completed', () => {
    const event = createMockCRMEvent({ type: 'form_step_completed', metadata: { value: '3', component: 'Wizard' } });
    expect(eventToActivity(event as any)).toContain('step 3');
  });

  it('describes error_occurred', () => {
    const event = createMockCRMEvent({ type: 'error_occurred', metadata: { errorMessage: 'Something broke' } });
    expect(eventToActivity(event as any)).toContain('Something broke');
  });

  it('describes api_error', () => {
    const event = createMockCRMEvent({ type: 'api_error', metadata: { errorCode: '500', errorMessage: 'Server error' } });
    const body = eventToActivity(event as any);
    expect(body).toContain('500');
    expect(body).toContain('Server error');
  });

  it('describes app_opened', () => {
    const event = createMockCRMEvent({ type: 'app_opened' });
    expect(eventToActivity(event as any)).toContain('Opened the app');
  });

  it('describes app_backgrounded', () => {
    const event = createMockCRMEvent({ type: 'app_backgrounded' });
    expect(eventToActivity(event as any)).toContain('background');
  });

  it('describes app_foregrounded', () => {
    const event = createMockCRMEvent({ type: 'app_foregrounded' });
    expect(eventToActivity(event as any)).toContain('foreground');
  });

  it('describes user_logged_out', () => {
    const event = createMockCRMEvent({ type: 'user_logged_out' });
    expect(eventToActivity(event as any)).toContain('logged out');
  });

  it('describes password_reset_requested', () => {
    const event = createMockCRMEvent({ type: 'password_reset_requested' });
    expect(eventToActivity(event as any)).toContain('password reset');
  });

  it('describes password_reset_completed', () => {
    const event = createMockCRMEvent({ type: 'password_reset_completed' });
    expect(eventToActivity(event as any)).toContain('completed password reset');
  });

  it('describes email_verified', () => {
    const event = createMockCRMEvent({ type: 'email_verified' });
    expect(eventToActivity(event as any)).toContain('verified');
  });

  it('describes profile_viewed', () => {
    const event = createMockCRMEvent({ type: 'profile_viewed' });
    expect(eventToActivity(event as any)).toContain('viewed their profile');
  });

  it('describes avatar_changed', () => {
    const event = createMockCRMEvent({ type: 'avatar_changed' });
    expect(eventToActivity(event as any)).toContain('avatar');
  });

  it('describes settings_updated', () => {
    const event = createMockCRMEvent({ type: 'settings_updated' });
    expect(eventToActivity(event as any)).toContain('settings');
  });

  it('describes request_submitted', () => {
    const event = createMockCRMEvent({ type: 'request_submitted' });
    expect(eventToActivity(event as any)).toContain('Submitted');
  });

  it('describes request_updated', () => {
    const event = createMockCRMEvent({ type: 'request_updated' });
    expect(eventToActivity(event as any)).toContain('Updated');
  });

  it('describes request_cancelled', () => {
    const event = createMockCRMEvent({ type: 'request_cancelled' });
    expect(eventToActivity(event as any)).toContain('Cancelled');
  });

  it('describes request_viewed', () => {
    const event = createMockCRMEvent({ type: 'request_viewed' });
    expect(eventToActivity(event as any)).toContain('Viewed');
  });

  it('describes request_draft_saved', () => {
    const event = createMockCRMEvent({ type: 'request_draft_saved' });
    expect(eventToActivity(event as any)).toContain('draft');
  });

  it('describes quote_viewed', () => {
    const event = createMockCRMEvent({ type: 'quote_viewed' });
    expect(eventToActivity(event as any)).toContain('Viewed quote');
  });

  it('describes quote_accepted', () => {
    const event = createMockCRMEvent({ type: 'quote_accepted' });
    expect(eventToActivity(event as any)).toContain('Accepted');
  });

  it('describes quote_rejected', () => {
    const event = createMockCRMEvent({ type: 'quote_rejected' });
    expect(eventToActivity(event as any)).toContain('Rejected');
  });

  it('describes quote_expired', () => {
    const event = createMockCRMEvent({ type: 'quote_expired' });
    expect(eventToActivity(event as any)).toContain('expired');
  });

  it('describes booking_created', () => {
    const event = createMockCRMEvent({ type: 'booking_created' });
    expect(eventToActivity(event as any)).toContain('booking');
  });

  it('describes booking_viewed', () => {
    const event = createMockCRMEvent({ type: 'booking_viewed' });
    expect(eventToActivity(event as any)).toContain('booking');
  });

  it('describes booking_updated', () => {
    const event = createMockCRMEvent({ type: 'booking_updated' });
    expect(eventToActivity(event as any)).toContain('booking');
  });

  it('describes booking_cancelled', () => {
    const event = createMockCRMEvent({ type: 'booking_cancelled' });
    expect(eventToActivity(event as any)).toContain('booking');
  });

  it('describes passenger_added', () => {
    const event = createMockCRMEvent({ type: 'passenger_added' });
    expect(eventToActivity(event as any)).toContain('passenger');
  });

  it('describes passenger_removed', () => {
    const event = createMockCRMEvent({ type: 'passenger_removed' });
    expect(eventToActivity(event as any)).toContain('passenger');
  });

  it('describes manifest_submitted', () => {
    const event = createMockCRMEvent({ type: 'manifest_submitted' });
    expect(eventToActivity(event as any)).toContain('manifest');
  });

  it('describes payment_initiated', () => {
    const event = createMockCRMEvent({ type: 'payment_initiated' });
    expect(eventToActivity(event as any)).toContain('payment');
  });

  it('handles unknown event type', () => {
    const event = createMockCRMEvent({ type: 'some_custom_event' });
    expect(eventToActivity(event as any)).toContain('some custom event');
  });

  it('includes properties in metadata', () => {
    const event = createMockCRMEvent({
      type: 'user_logged_in',
      properties: { browser: 'Chrome' },
      metadata: { screen: 'Login', component: 'LoginForm', action: 'click' },
    });
    const body = eventToActivity(event as any);
    expect(body).toContain('Screen: Login');
    expect(body).toContain('Component: LoginForm');
    expect(body).toContain('Action: click');
    expect(body).toContain('Browser: "Chrome"');
  });

  it('skips null/undefined properties', () => {
    const event = createMockCRMEvent({
      type: 'user_logged_in',
      properties: { key1: 'value', key2: null, key3: undefined },
    });
    const body = eventToActivity(event as any);
    expect(body).toContain('Key1: "value"');
    expect(body).not.toContain('Key2');
    expect(body).not.toContain('Key3');
  });

  it('handles events with no properties', () => {
    const event = createMockCRMEvent({ type: 'user_logged_in', properties: undefined, metadata: undefined });
    const body = eventToActivity(event as any);
    expect(body).toContain('[user_logged_in]');
  });
});

describe('generateEventId', () => {
  it('returns a string', () => {
    expect(typeof generateEventId()).toBe('string');
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateEventId()));
    expect(ids.size).toBe(100);
  });
});

describe('createCRMEvent', () => {
  it('creates event with type and timestamp', () => {
    const event = createCRMEvent('user_logged_in');
    expect(event.type).toBe('user_logged_in');
    expect(typeof event.timestamp).toBe('string');
    expect(typeof event.id).toBe('string');
    expect(event.id.length).toBeGreaterThan(0);
  });

  it('includes optional fields', () => {
    const event = createCRMEvent('profile_updated', {
      userId: 'u-1',
      contactId: 'c-1',
      properties: { field: 'name' },
    });
    expect(event.userId).toBe('u-1');
    expect(event.contactId).toBe('c-1');
    expect(event.properties?.field).toBe('name');
  });
});
