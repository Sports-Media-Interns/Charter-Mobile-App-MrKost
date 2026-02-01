// CRM Service - Main orchestration service for CRM integration

import {
  CRMConfig,
  CRMContact,
  CRMContactCache,
  CRMEvent,
  CRMEventType,
  CRMOpportunityStatus,
  CRMSyncStatus,
} from '@/types/crm';
import { Tables } from '@/types/database';
import { CRMApiClient } from './CRMApiClient';
import { CRMEventQueue } from './CRMEventQueue';
import {
  userToContact,
  organizationToContact,
  requestToOpportunity,
  eventToActivity,
  createCRMEvent,
} from './CRMDataMapper';

const CONTACT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const SYNC_INTERVAL_MS = 30 * 1000; // 30 seconds

export class CRMService {
  private static instance: CRMService | null = null;

  private apiClient: CRMApiClient;
  private eventQueue: CRMEventQueue;
  private contactCache: CRMContactCache = {};
  private currentUserId?: string;
  private currentContactId?: string;
  private syncInterval?: ReturnType<typeof setInterval>;
  private isOnline: boolean = true;
  private initialized: boolean = false;

  private constructor(config: CRMConfig) {
    this.apiClient = new CRMApiClient(config);
    this.eventQueue = new CRMEventQueue();
  }

  static getInstance(config?: CRMConfig): CRMService {
    if (!CRMService.instance) {
      if (!config) {
        throw new Error('CRM config required for initialization');
      }
      CRMService.instance = new CRMService(config);
    }
    return CRMService.instance;
  }

  static isInitialized(): boolean {
    return CRMService.instance !== null && CRMService.instance.initialized;
  }

  static destroyInstance(): void {
    if (CRMService.instance) {
      CRMService.instance.cleanup();
      CRMService.instance = null;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.eventQueue.initialize();
    this.eventQueue.setProcessor(this.processEvent.bind(this));
    this.startBackgroundSync();
    this.initialized = true;
  }

  cleanup(): void {
    this.stopBackgroundSync();
    this.initialized = false;
  }

  // Online/Offline handling

  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    this.eventQueue.setOnlineStatus(isOnline);

    if (isOnline) {
      this.eventQueue.processQueue();
    }
  }

  // Contact Management

  async identifyUser(
    user: Tables<'users'>,
    organizationData?: {
      name?: string;
      type?: string;
    }
  ): Promise<string | null> {
    this.currentUserId = user.id;

    // Check cache first
    const cached = this.getCachedContact(user.email);
    if (cached) {
      this.currentContactId = cached.id;
      return cached.id || null;
    }

    // Try to find existing contact
    const existingResult = await this.apiClient.findContactByEmail(user.email);
    if (existingResult.success && existingResult.data?.contacts?.length) {
      const contact = existingResult.data.contacts[0];
      this.cacheContact(user.email, contact);
      this.currentContactId = contact.id;

      // Update contact with latest data
      if (contact.id) {
        await this.updateContact(contact.id, user, organizationData);
      }

      return contact.id || null;
    }

    // Create new contact
    const payload = userToContact(user, {
      organizationName: organizationData?.name,
      organizationType: organizationData?.type,
    });

    const createResult = await this.apiClient.createContact(payload);
    if (createResult.success && createResult.data?.contact) {
      const contact = createResult.data.contact;
      this.cacheContact(user.email, contact);
      this.currentContactId = contact.id;
      return contact.id || null;
    }

    return null;
  }

  private async updateContact(
    contactId: string,
    user: Tables<'users'>,
    organizationData?: {
      name?: string;
      type?: string;
    }
  ): Promise<void> {
    const payload = userToContact(user, {
      organizationName: organizationData?.name,
      organizationType: organizationData?.type,
    });

    await this.apiClient.updateContact(contactId, payload);
  }

  async identifyOrganization(org: {
    id: string;
    name: string;
    type?: string;
    sport?: string;
    airport?: string;
    email?: string;
    phone?: string;
  }): Promise<string | null> {
    const email = org.email || `org-${org.id}@charter.sportsmedia.net`;

    // Check cache
    const cached = this.getCachedContact(email);
    if (cached?.id) {
      return cached.id;
    }

    // Try to find existing
    const existingResult = await this.apiClient.findContactByEmail(email);
    if (existingResult.success && existingResult.data?.contacts?.length) {
      const contact = existingResult.data.contacts[0];
      this.cacheContact(email, contact);
      return contact.id || null;
    }

    // Create new
    const payload = organizationToContact(org);
    const createResult = await this.apiClient.createContact(payload);

    if (createResult.success && createResult.data?.contact) {
      const contact = createResult.data.contact;
      this.cacheContact(email, contact);
      return contact.id || null;
    }

    return null;
  }

  private getCachedContact(email: string): CRMContact | null {
    const cached = this.contactCache[email];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.cachedAt > CONTACT_CACHE_TTL_MS) {
      delete this.contactCache[email];
      return null;
    }

    return cached.contact;
  }

  private cacheContact(email: string, contact: CRMContact): void {
    this.contactCache[email] = {
      contact,
      cachedAt: Date.now(),
    };
  }

  clearContactCache(): void {
    this.contactCache = {};
  }

  // Opportunity Management

  async createRequestOpportunity(
    request: {
      id: string;
      trip_type?: string;
      passenger_count?: number;
      urgency?: string;
      status?: string;
      special_requirements?: string;
    },
    estimatedValue?: number
  ): Promise<string | null> {
    const contactId = this.currentContactId;
    if (!contactId) {
      console.warn('No contact identified for opportunity creation');
      return null;
    }

    const payload = requestToOpportunity(request, contactId, estimatedValue);
    const result = await this.apiClient.createOpportunity(payload);

    if (result.success && result.data?.opportunity) {
      return result.data.opportunity.id || null;
    }

    return null;
  }

  async updateOpportunityStatus(
    opportunityId: string,
    status: CRMOpportunityStatus
  ): Promise<boolean> {
    const result = await this.apiClient.updateOpportunityStatus(opportunityId, status);
    return result.success;
  }

  async updateOpportunityValue(
    opportunityId: string,
    value: number
  ): Promise<boolean> {
    const result = await this.apiClient.updateOpportunity(opportunityId, {
      monetaryValue: value,
    } as any);
    return result.success;
  }

  // Event Tracking

  async trackEvent(
    type: CRMEventType,
    options?: {
      properties?: Record<string, unknown>;
      metadata?: CRMEvent['metadata'];
    }
  ): Promise<void> {
    const event = createCRMEvent(type, {
      userId: this.currentUserId,
      contactId: this.currentContactId,
      properties: options?.properties,
      metadata: options?.metadata,
    });

    await this.eventQueue.enqueue(event);
  }

  async trackScreenView(screenName: string): Promise<void> {
    await this.trackEvent('screen_viewed', {
      metadata: { screen: screenName },
    });
  }

  async trackButtonClick(
    buttonName: string,
    screenName?: string
  ): Promise<void> {
    await this.trackEvent('button_clicked', {
      metadata: {
        action: buttonName,
        screen: screenName,
      },
    });
  }

  async trackFormSubmit(
    formName: string,
    properties?: Record<string, unknown>
  ): Promise<void> {
    await this.trackEvent('form_submitted', {
      properties,
      metadata: { component: formName },
    });
  }

  async trackFormAbandon(
    formName: string,
    step?: number | string
  ): Promise<void> {
    await this.trackEvent('form_abandoned', {
      metadata: {
        component: formName,
        value: step?.toString(),
      },
    });
  }

  async trackError(
    errorMessage: string,
    errorCode?: string,
    screen?: string
  ): Promise<void> {
    await this.trackEvent('error_occurred', {
      metadata: {
        errorMessage,
        errorCode,
        screen,
      },
    });
  }

  // Event Processing

  private async processEvent(event: CRMEvent): Promise<boolean> {
    const contactId = event.contactId || this.currentContactId;
    if (!contactId) {
      // Cannot process event without contact
      return true; // Return true to remove from queue since we can't process it
    }

    const noteBody = eventToActivity(event);
    const result = await this.apiClient.addNote({
      contactId,
      body: noteBody,
    });

    return result.success;
  }

  // Background Sync

  private startBackgroundSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.eventQueue.processQueue();
      }
    }, SYNC_INTERVAL_MS);
  }

  private stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  // Status

  getSyncStatus(): CRMSyncStatus {
    return {
      isOnline: this.isOnline,
      queueLength: this.eventQueue.getQueueLength(),
      errors: this.eventQueue
        .getFailedEvents()
        .map((e) => e.error || 'Unknown error'),
    };
  }

  getCurrentContactId(): string | undefined {
    return this.currentContactId;
  }

  getCurrentUserId(): string | undefined {
    return this.currentUserId;
  }

  isConfigured(): boolean {
    return this.apiClient.isConfigured();
  }

  // Manual queue operations

  async forceSync(): Promise<void> {
    await this.eventQueue.processQueue();
  }

  async clearEventQueue(): Promise<void> {
    await this.eventQueue.clearQueue();
  }

  getQueueLength(): number {
    return this.eventQueue.getQueueLength();
  }
}
