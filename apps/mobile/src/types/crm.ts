// CRM Types - Generic abstraction layer for CRM integration

export interface CRMConfig {
  apiBaseUrl: string;
  apiKey: string;
  enabled: boolean;
}

// Contact represents a user or organization in the CRM
export interface CRMContact {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
  customField?: Record<string, unknown>;
  source?: string;
  dateAdded?: string;
}

export interface CRMContactCreatePayload {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
  customField?: Record<string, unknown>;
  source?: string;
}

// Opportunity represents a deal/pipeline item in the CRM
export interface CRMOpportunity {
  id?: string;
  title: string;
  status: CRMOpportunityStatus;
  monetaryValue?: number;
  pipelineId?: string;
  pipelineStageId?: string;
  contactId: string;
  assignedTo?: string;
  source?: string;
  dateAdded?: string;
  customFields?: Record<string, unknown>;
}

export type CRMOpportunityStatus =
  | 'open'
  | 'won'
  | 'lost'
  | 'abandoned';

export interface CRMOpportunityCreatePayload {
  title: string;
  status: CRMOpportunityStatus;
  monetaryValue?: number;
  pipelineId?: string;
  pipelineStageId?: string;
  contactId: string;
  source?: string;
  customFields?: Record<string, unknown>;
}

// Activity represents a note or activity logged in the CRM
export interface CRMActivity {
  id?: string;
  contactId: string;
  body: string;
  dateAdded?: string;
  userId?: string;
}

export interface CRMActivityCreatePayload {
  contactId: string;
  body: string;
}

// Task represents a follow-up task in the CRM
export interface CRMTask {
  id?: string;
  title: string;
  body?: string;
  dueDate: string;
  completed: boolean;
  contactId?: string;
  assignedTo?: string;
}

export interface CRMTaskCreatePayload {
  title: string;
  body?: string;
  dueDate: string;
  contactId?: string;
  assignedTo?: string;
}

// Event types for tracking user activity
export type CRMEventType =
  // Authentication events
  | 'user_registered'
  | 'user_logged_in'
  | 'user_logged_out'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'email_verified'
  | 'session_expired'
  // Profile events
  | 'profile_viewed'
  | 'profile_updated'
  | 'avatar_changed'
  | 'settings_updated'
  | 'notification_preferences_updated'
  // Request events
  | 'request_created'
  | 'request_submitted'
  | 'request_updated'
  | 'request_cancelled'
  | 'request_viewed'
  | 'request_draft_saved'
  // Quote events
  | 'quote_received'
  | 'quote_viewed'
  | 'quote_accepted'
  | 'quote_rejected'
  | 'quote_expired'
  | 'quote_comparison_viewed'
  // Booking events
  | 'booking_created'
  | 'booking_viewed'
  | 'booking_updated'
  | 'booking_cancelled'
  | 'passenger_added'
  | 'passenger_removed'
  | 'manifest_submitted'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  // Navigation events
  | 'screen_viewed'
  | 'button_clicked'
  | 'form_submitted'
  | 'form_abandoned'
  | 'form_step_completed'
  | 'search_performed'
  | 'filter_applied'
  // Engagement events
  | 'app_opened'
  | 'app_backgrounded'
  | 'app_foregrounded'
  | 'push_notification_received'
  | 'push_notification_opened'
  | 'deep_link_opened'
  // Error events
  | 'error_occurred'
  | 'api_error'
  | 'validation_error';

// Event payload for tracking
export interface CRMEvent {
  id: string;
  type: CRMEventType;
  timestamp: string;
  userId?: string;
  contactId?: string;
  properties?: Record<string, unknown>;
  metadata?: {
    screen?: string;
    component?: string;
    action?: string;
    value?: string | number;
    previousValue?: string | number;
    errorMessage?: string;
    errorCode?: string;
  };
}

// Queue item for offline persistence
export interface CRMQueueItem {
  id: string;
  event: CRMEvent;
  retryCount: number;
  createdAt: string;
  lastAttempt?: string;
  error?: string;
}

// API Response types
export interface CRMApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface CRMContactResponse {
  contact: CRMContact;
}

export interface CRMContactsSearchResponse {
  contacts: CRMContact[];
  meta?: {
    total: number;
    currentPage: number;
    nextPage?: number;
  };
}

export interface CRMOpportunityResponse {
  opportunity: CRMOpportunity;
}

export interface CRMNoteResponse {
  note: CRMActivity;
}

export interface CRMTaskResponse {
  task: CRMTask;
}

// Cache types
export interface CRMContactCache {
  [email: string]: {
    contact: CRMContact;
    cachedAt: number;
  };
}

// Sync status
export interface CRMSyncStatus {
  isOnline: boolean;
  lastSyncAt?: string;
  queueLength: number;
  errors: string[];
}
