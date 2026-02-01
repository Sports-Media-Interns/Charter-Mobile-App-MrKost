// CRM Data Mapper - Transforms app entities to CRM entities

import {
  CRMContactCreatePayload,
  CRMOpportunityCreatePayload,
  CRMEvent,
  CRMEventType,
} from '@/types/crm';
import { Tables } from '@/types/database';

// User to Contact mapping
export function userToContact(
  user: Tables<'users'>,
  additionalData?: {
    organizationName?: string;
    organizationType?: string;
  }
): CRMContactCreatePayload {
  const nameParts = (user.full_name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    email: user.email,
    firstName,
    lastName,
    name: user.full_name || undefined,
    phone: user.phone || undefined,
    companyName: additionalData?.organizationName,
    tags: buildUserTags(user, additionalData),
    customField: {
      appUserId: user.id,
      role: user.role,
      organizationType: additionalData?.organizationType,
      createdAt: user.created_at,
    },
    source: 'sports_media_charter_app',
  };
}

function buildUserTags(
  user: Tables<'users'>,
  additionalData?: {
    organizationName?: string;
    organizationType?: string;
  }
): string[] {
  const tags: string[] = ['charter_app_user'];

  if (user.role) {
    tags.push(`role_${user.role}`);
  }

  if (additionalData?.organizationType) {
    tags.push(`org_${additionalData.organizationType}`);
  }

  return tags;
}

// Organization to Contact (Company) mapping
export function organizationToContact(org: {
  id: string;
  name: string;
  type?: string;
  sport?: string;
  airport?: string;
  email?: string;
  phone?: string;
}): CRMContactCreatePayload {
  return {
    email: org.email || `org-${org.id}@charter.sportsmedia.net`,
    name: org.name,
    companyName: org.name,
    phone: org.phone,
    tags: buildOrgTags(org),
    customField: {
      appOrgId: org.id,
      organizationType: org.type,
      sport: org.sport,
      homeAirport: org.airport,
      isOrganization: true,
    },
    source: 'sports_media_charter_app',
  };
}

function buildOrgTags(org: {
  type?: string;
  sport?: string;
}): string[] {
  const tags: string[] = ['organization', 'charter_client'];

  if (org.type) {
    tags.push(`org_type_${org.type}`);
  }

  if (org.sport) {
    tags.push(`sport_${org.sport.toLowerCase().replace(/\s+/g, '_')}`);
  }

  return tags;
}

// Charter Request to Opportunity mapping
export function requestToOpportunity(
  request: {
    id: string;
    trip_type?: string;
    passenger_count?: number;
    urgency?: string;
    status?: string;
    special_requirements?: string;
  },
  contactId: string,
  estimatedValue?: number
): CRMOpportunityCreatePayload {
  const urgencyMultiplier = getUrgencyMultiplier(request.urgency);
  const passengerMultiplier = Math.max(1, (request.passenger_count || 1) / 10);
  const baseValue = 25000;

  const monetaryValue =
    estimatedValue || Math.round(baseValue * urgencyMultiplier * passengerMultiplier);

  return {
    title: buildOpportunityTitle(request),
    status: mapRequestStatusToOpportunityStatus(request.status),
    monetaryValue,
    contactId,
    source: 'sports_media_charter_app',
    customFields: {
      appRequestId: request.id,
      tripType: request.trip_type,
      passengerCount: request.passenger_count,
      urgency: request.urgency,
      specialRequirements: request.special_requirements,
    },
  };
}

function buildOpportunityTitle(request: {
  trip_type?: string;
  passenger_count?: number;
  urgency?: string;
}): string {
  const tripType = request.trip_type?.replace('_', ' ') || 'charter';
  const pax = request.passenger_count || 0;
  const urgency = request.urgency === 'emergency' ? '[URGENT] ' : '';

  return `${urgency}${capitalizeFirst(tripType)} - ${pax} passengers`;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getUrgencyMultiplier(urgency?: string): number {
  switch (urgency) {
    case 'emergency':
      return 1.5;
    case 'urgent':
      return 1.25;
    default:
      return 1;
  }
}

function mapRequestStatusToOpportunityStatus(
  status?: string
): 'open' | 'won' | 'lost' | 'abandoned' {
  switch (status) {
    case 'booked':
    case 'completed':
      return 'won';
    case 'cancelled':
      return 'lost';
    case 'expired':
      return 'abandoned';
    default:
      return 'open';
  }
}

// Event to Activity/Note mapping
export function eventToActivity(event: CRMEvent): string {
  const timestamp = new Date(event.timestamp).toLocaleString();
  const eventDescription = getEventDescription(event);
  const metadata = formatMetadata(event);

  let body = `[${event.type}] ${eventDescription}`;

  if (metadata) {
    body += `\n\nDetails:\n${metadata}`;
  }

  body += `\n\nTimestamp: ${timestamp}`;

  return body;
}

function getEventDescription(event: CRMEvent): string {
  const { type, metadata, properties } = event;

  switch (type) {
    // Auth events
    case 'user_registered':
      return 'User registered for a new account';
    case 'user_logged_in':
      return 'User logged into the app';
    case 'user_logged_out':
      return 'User logged out of the app';
    case 'password_reset_requested':
      return 'User requested a password reset';
    case 'password_reset_completed':
      return 'User completed password reset';
    case 'email_verified':
      return 'User verified their email address';

    // Profile events
    case 'profile_viewed':
      return 'User viewed their profile';
    case 'profile_updated':
      return `User updated their profile${getUpdatedFields(properties)}`;
    case 'avatar_changed':
      return 'User changed their avatar';
    case 'settings_updated':
      return 'User updated their settings';

    // Request events
    case 'request_created':
      return `Created new charter request${getRequestInfo(properties)}`;
    case 'request_submitted':
      return `Submitted charter request for quotes${getRequestInfo(properties)}`;
    case 'request_updated':
      return `Updated charter request${getUpdatedFields(properties)}`;
    case 'request_cancelled':
      return 'Cancelled charter request';
    case 'request_viewed':
      return 'Viewed charter request details';
    case 'request_draft_saved':
      return 'Saved charter request as draft';

    // Quote events
    case 'quote_received':
      return `Received new quote${getQuoteInfo(properties)}`;
    case 'quote_viewed':
      return `Viewed quote${getQuoteInfo(properties)}`;
    case 'quote_accepted':
      return `Accepted quote${getQuoteInfo(properties)}`;
    case 'quote_rejected':
      return 'Rejected quote';
    case 'quote_expired':
      return 'Quote expired';

    // Booking events
    case 'booking_created':
      return 'Created new booking';
    case 'booking_viewed':
      return 'Viewed booking details';
    case 'booking_updated':
      return 'Updated booking';
    case 'booking_cancelled':
      return 'Cancelled booking';
    case 'passenger_added':
      return 'Added passenger to manifest';
    case 'passenger_removed':
      return 'Removed passenger from manifest';
    case 'manifest_submitted':
      return 'Submitted passenger manifest';
    case 'payment_initiated':
      return 'Initiated payment';
    case 'payment_completed':
      return `Payment completed${getPaymentInfo(properties)}`;
    case 'payment_failed':
      return `Payment failed${getErrorInfo(properties)}`;

    // Navigation events
    case 'screen_viewed':
      return `Viewed ${metadata?.screen || 'screen'}`;
    case 'button_clicked':
      return `Clicked ${metadata?.action || 'button'} on ${metadata?.screen || 'screen'}`;
    case 'form_submitted':
      return `Submitted ${metadata?.component || 'form'}`;
    case 'form_abandoned':
      return `Abandoned ${metadata?.component || 'form'} at step ${metadata?.value || 'unknown'}`;
    case 'form_step_completed':
      return `Completed step ${metadata?.value || ''} of ${metadata?.component || 'form'}`;

    // Error events
    case 'error_occurred':
      return `Error occurred: ${metadata?.errorMessage || 'Unknown error'}`;
    case 'api_error':
      return `API error (${metadata?.errorCode || 'unknown'}): ${metadata?.errorMessage || 'Unknown error'}`;

    // App lifecycle
    case 'app_opened':
      return 'Opened the app';
    case 'app_backgrounded':
      return 'App moved to background';
    case 'app_foregrounded':
      return 'App returned to foreground';

    default:
      return `${type.replace(/_/g, ' ')}`;
  }
}

function getUpdatedFields(properties?: Record<string, unknown>): string {
  if (!properties?.updatedFields) return '';
  const fields = properties.updatedFields as string[];
  return ` (${fields.join(', ')})`;
}

function getRequestInfo(properties?: Record<string, unknown>): string {
  if (!properties) return '';
  const parts: string[] = [];

  if (properties.tripType) {
    parts.push(`${properties.tripType}`);
  }
  if (properties.passengerCount) {
    parts.push(`${properties.passengerCount} pax`);
  }

  return parts.length ? ` - ${parts.join(', ')}` : '';
}

function getQuoteInfo(properties?: Record<string, unknown>): string {
  if (!properties) return '';
  const parts: string[] = [];

  if (properties.operator) {
    parts.push(`from ${properties.operator}`);
  }
  if (properties.price) {
    parts.push(`$${Number(properties.price).toLocaleString()}`);
  }

  return parts.length ? ` ${parts.join(' - ')}` : '';
}

function getPaymentInfo(properties?: Record<string, unknown>): string {
  if (!properties?.amount) return '';
  return ` - $${Number(properties.amount).toLocaleString()}`;
}

function getErrorInfo(properties?: Record<string, unknown>): string {
  if (!properties?.error) return '';
  return ` - ${properties.error}`;
}

function formatMetadata(event: CRMEvent): string {
  const lines: string[] = [];

  if (event.metadata?.screen) {
    lines.push(`Screen: ${event.metadata.screen}`);
  }
  if (event.metadata?.component) {
    lines.push(`Component: ${event.metadata.component}`);
  }
  if (event.metadata?.action) {
    lines.push(`Action: ${event.metadata.action}`);
  }

  if (event.properties) {
    Object.entries(event.properties).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        lines.push(`${capitalizeFirst(key)}: ${JSON.stringify(value)}`);
      }
    });
  }

  return lines.join('\n');
}

// Utility to generate unique event ID
export function generateEventId(): string {
  // Use a combination of timestamp and random string
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

// Create CRM event helper
export function createCRMEvent(
  type: CRMEventType,
  options?: {
    userId?: string;
    contactId?: string;
    properties?: Record<string, unknown>;
    metadata?: CRMEvent['metadata'];
  }
): CRMEvent {
  return {
    id: generateEventId(),
    type,
    timestamp: new Date().toISOString(),
    userId: options?.userId,
    contactId: options?.contactId,
    properties: options?.properties,
    metadata: options?.metadata,
  };
}
