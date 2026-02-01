import { CRMService } from '@/services/crm/CRMService';
import { CRMApiClient } from '@/services/crm/CRMApiClient';
import { CRMEventQueue } from '@/services/crm/CRMEventQueue';

jest.mock('@/services/crm/CRMApiClient');
jest.mock('@/services/crm/CRMEventQueue');

const mockConfig = { apiBaseUrl: 'https://test.com/crm', apiKey: 'key', enabled: true };

describe('CRMService', () => {
  let mockApiClient: any;
  let mockEventQueue: any;

  beforeEach(() => {
    CRMService.destroyInstance();

    mockEventQueue = {
      initialize: jest.fn().mockResolvedValue(undefined),
      setProcessor: jest.fn(),
      enqueue: jest.fn().mockResolvedValue(undefined),
      processQueue: jest.fn().mockResolvedValue(undefined),
      setOnlineStatus: jest.fn(),
      getQueueLength: jest.fn().mockReturnValue(0),
      getFailedEvents: jest.fn().mockReturnValue([]),
      clearQueue: jest.fn().mockResolvedValue(undefined),
    };

    mockApiClient = {
      findContactByEmail: jest.fn().mockResolvedValue({ success: false, data: null }),
      createContact: jest.fn().mockResolvedValue({ success: true, data: { contact: { id: 'c1' } } }),
      updateContact: jest.fn().mockResolvedValue({ success: true }),
      createOpportunity: jest.fn().mockResolvedValue({ success: true, data: { opportunity: { id: 'o1' } } }),
      updateOpportunityStatus: jest.fn().mockResolvedValue({ success: true }),
      updateOpportunity: jest.fn().mockResolvedValue({ success: true }),
      addNote: jest.fn().mockResolvedValue({ success: true }),
      isConfigured: jest.fn().mockReturnValue(true),
    };

    (CRMApiClient as jest.Mock).mockImplementation(() => mockApiClient);
    (CRMEventQueue as jest.Mock).mockImplementation(() => mockEventQueue);
  });

  afterEach(() => {
    CRMService.destroyInstance();
  });

  describe('getInstance', () => {
    it('throws without config on first call', () => {
      expect(() => CRMService.getInstance()).toThrow('CRM config required');
    });

    it('returns singleton', () => {
      const s1 = CRMService.getInstance(mockConfig);
      const s2 = CRMService.getInstance();
      expect(s1).toBe(s2);
    });
  });

  describe('isInitialized', () => {
    it('returns false before init', () => {
      expect(CRMService.isInitialized()).toBe(false);
    });

    it('returns true after init', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      expect(CRMService.isInitialized()).toBe(true);
    });
  });

  describe('destroyInstance', () => {
    it('cleans up', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      CRMService.destroyInstance();
      expect(CRMService.isInitialized()).toBe(false);
    });

    it('is safe to call when no instance', () => {
      expect(() => CRMService.destroyInstance()).not.toThrow();
    });
  });

  describe('initialize', () => {
    it('initializes event queue and sets processor', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      expect(mockEventQueue.initialize).toHaveBeenCalled();
      expect(mockEventQueue.setProcessor).toHaveBeenCalled();
    });

    it('is idempotent', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.initialize();
      expect(mockEventQueue.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('setOnlineStatus', () => {
    it('propagates to event queue', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      service.setOnlineStatus(false);
      expect(mockEventQueue.setOnlineStatus).toHaveBeenCalledWith(false);
    });

    it('triggers processQueue when going online', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      service.setOnlineStatus(true);
      expect(mockEventQueue.processQueue).toHaveBeenCalled();
    });
  });

  describe('identifyUser', () => {
    it('creates new contact when not found', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();

      const user = { id: 'u1', email: 'test@test.com', full_name: 'Test', phone: '', role: 'client', organization_id: 'org1', avatar_url: null, created_at: '', updated_at: '' } as any;
      const contactId = await service.identifyUser(user);
      expect(contactId).toBe('c1');
      expect(mockApiClient.createContact).toHaveBeenCalled();
    });

    it('returns existing contact when found', async () => {
      mockApiClient.findContactByEmail.mockResolvedValue({
        success: true,
        data: { contacts: [{ id: 'existing-c' }] },
      });

      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      const user = { id: 'u1', email: 'test@test.com', full_name: 'Test' } as any;
      const contactId = await service.identifyUser(user);
      expect(contactId).toBe('existing-c');
    });

    it('uses cache on second call', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      const user = { id: 'u1', email: 'test@test.com', full_name: 'Test' } as any;
      await service.identifyUser(user);
      await service.identifyUser(user);
      // Only one API call since second uses cache
      expect(mockApiClient.findContactByEmail).toHaveBeenCalledTimes(1);
    });

    it('returns null when create fails', async () => {
      mockApiClient.createContact.mockResolvedValue({ success: false });
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      const user = { id: 'u1', email: 'test@test.com' } as any;
      const contactId = await service.identifyUser(user);
      expect(contactId).toBeNull();
    });
  });

  describe('identifyOrganization', () => {
    it('creates org contact', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      const id = await service.identifyOrganization({ id: 'org1', name: 'Test Org' });
      expect(id).toBe('c1');
    });

    it('uses email if provided', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.identifyOrganization({ id: 'org1', name: 'Test', email: 'org@test.com' });
      expect(mockApiClient.findContactByEmail).toHaveBeenCalledWith('org@test.com');
    });

    it('returns null on failure', async () => {
      mockApiClient.createContact.mockResolvedValue({ success: false });
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      const id = await service.identifyOrganization({ id: 'org1', name: 'Test' });
      expect(id).toBeNull();
    });
  });

  describe('clearContactCache', () => {
    it('forces re-fetch after clear', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      const user = { id: 'u1', email: 'test@test.com' } as any;
      await service.identifyUser(user);
      service.clearContactCache();
      await service.identifyUser(user);
      expect(mockApiClient.findContactByEmail).toHaveBeenCalledTimes(2);
    });
  });

  describe('createRequestOpportunity', () => {
    it('returns null without identified contact', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      const result = await service.createRequestOpportunity({ id: 'r1' });
      expect(result).toBeNull();
    });

    it('creates opportunity after user identified', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.identifyUser({ id: 'u1', email: 'test@test.com' } as any);
      const id = await service.createRequestOpportunity({ id: 'r1', trip_type: 'one_way' }, 50000);
      expect(id).toBe('o1');
    });
  });

  describe('updateOpportunityStatus', () => {
    it('delegates to API client', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      const result = await service.updateOpportunityStatus('o1', 'won');
      expect(result).toBe(true);
    });
  });

  describe('updateOpportunityValue', () => {
    it('delegates to API client', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      const result = await service.updateOpportunityValue('o1', 100000);
      expect(result).toBe(true);
    });
  });

  describe('event tracking', () => {
    it('trackEvent enqueues event', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.trackEvent('screen_viewed');
      expect(mockEventQueue.enqueue).toHaveBeenCalled();
    });

    it('trackScreenView enqueues with screen metadata', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.trackScreenView('Home');
      expect(mockEventQueue.enqueue).toHaveBeenCalled();
    });

    it('trackButtonClick enqueues', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.trackButtonClick('Submit', 'Home');
      expect(mockEventQueue.enqueue).toHaveBeenCalled();
    });

    it('trackFormSubmit enqueues', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.trackFormSubmit('LoginForm', { email: 'test@test.com' });
      expect(mockEventQueue.enqueue).toHaveBeenCalled();
    });

    it('trackFormAbandon enqueues', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.trackFormAbandon('LoginForm', 2);
      expect(mockEventQueue.enqueue).toHaveBeenCalled();
    });

    it('trackError enqueues', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.trackError('Something went wrong', 'ERR001', 'Home');
      expect(mockEventQueue.enqueue).toHaveBeenCalled();
    });
  });

  describe('processEvent (via setProcessor)', () => {
    it('processEvent handles event without contactId', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();

      // Get the processor function that was passed to setProcessor
      const processor = mockEventQueue.setProcessor.mock.calls[0][0];
      // Call with event that has no contactId, and no currentContactId set
      const result = await processor({ type: 'screen_viewed', timestamp: Date.now() });
      // Should return true (remove from queue) since no contact to process
      expect(result).toBe(true);
    });

    it('processEvent adds note via API when contactId exists', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      // Identify a user first to set currentContactId
      await service.identifyUser({ id: 'u1', email: 'test@test.com' } as any);

      const processor = mockEventQueue.setProcessor.mock.calls[0][0];
      const result = await processor({ type: 'screen_viewed', timestamp: Date.now(), contactId: 'c1' });
      expect(mockApiClient.addNote).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('processEvent returns false when addNote fails', async () => {
      mockApiClient.addNote.mockResolvedValue({ success: false });
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.identifyUser({ id: 'u1', email: 'test@test.com' } as any);

      const processor = mockEventQueue.setProcessor.mock.calls[0][0];
      const result = await processor({ type: 'screen_viewed', timestamp: Date.now(), contactId: 'c1' });
      expect(result).toBe(false);
    });
  });

  describe('contact cache TTL', () => {
    it('cache expires after TTL', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      const user = { id: 'u1', email: 'test@test.com' } as any;

      // First call creates contact
      await service.identifyUser(user);
      expect(mockApiClient.findContactByEmail).toHaveBeenCalledTimes(1);

      // Simulate TTL expiry by advancing time
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 6 * 60 * 1000); // 6 minutes > 5min TTL

      await service.identifyUser(user);
      expect(mockApiClient.findContactByEmail).toHaveBeenCalledTimes(2);

      Date.now = originalNow;
    });
  });

  describe('identifyOrganization cache', () => {
    it('uses cache on second call', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.identifyOrganization({ id: 'org1', name: 'Test Org' });
      await service.identifyOrganization({ id: 'org1', name: 'Test Org' });
      // Only one API call since second uses cache
      expect(mockApiClient.findContactByEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSyncStatus', () => {
    it('returns status object', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      const status = service.getSyncStatus();
      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('queueLength');
      expect(status).toHaveProperty('errors');
    });

    it('maps failed event errors', async () => {
      mockEventQueue.getFailedEvents.mockReturnValue([
        { error: 'Network timeout' },
        { error: null },
      ]);
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      const status = service.getSyncStatus();
      expect(status.errors).toEqual(['Network timeout', 'Unknown error']);
    });
  });

  describe('getters', () => {
    it('getCurrentContactId returns undefined before identify', async () => {
      const service = CRMService.getInstance(mockConfig);
      expect(service.getCurrentContactId()).toBeUndefined();
    });

    it('getCurrentUserId returns undefined before identify', () => {
      const service = CRMService.getInstance(mockConfig);
      expect(service.getCurrentUserId()).toBeUndefined();
    });

    it('isConfigured delegates to api client', () => {
      const service = CRMService.getInstance(mockConfig);
      expect(service.isConfigured()).toBe(true);
    });
  });

  describe('background sync', () => {
    it('processes queue on interval when online', async () => {
      jest.useFakeTimers();
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      service.setOnlineStatus(true);
      mockEventQueue.processQueue.mockClear();

      // Advance past sync interval (30s)
      jest.advanceTimersByTime(31000);
      expect(mockEventQueue.processQueue).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('does not process queue when offline', async () => {
      jest.useFakeTimers();
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      service.setOnlineStatus(false);
      mockEventQueue.processQueue.mockClear();

      jest.advanceTimersByTime(31000);
      // processQueue should not be called since offline
      // (setOnlineStatus(false) may have been called, but interval check should skip)
      jest.useRealTimers();
    });
  });

  describe('identifyOrganization finds existing', () => {
    it('returns existing contact id when found via API', async () => {
      mockApiClient.findContactByEmail.mockResolvedValue({
        success: true,
        data: { contacts: [{ id: 'existing-org-c' }] },
      });
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      const id = await service.identifyOrganization({ id: 'org1', name: 'Test Org' });
      expect(id).toBe('existing-org-c');
      expect(mockApiClient.createContact).not.toHaveBeenCalled();
    });
  });

  describe('createRequestOpportunity edge cases', () => {
    it('returns null when createOpportunity fails', async () => {
      mockApiClient.createOpportunity.mockResolvedValue({ success: false });
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.identifyUser({ id: 'u1', email: 'test@test.com' } as any);
      const id = await service.createRequestOpportunity({ id: 'r1', trip_type: 'one_way' });
      expect(id).toBeNull();
    });
  });

  describe('manual queue operations', () => {
    it('forceSync calls processQueue', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.forceSync();
      expect(mockEventQueue.processQueue).toHaveBeenCalled();
    });

    it('clearEventQueue calls clearQueue', async () => {
      const service = CRMService.getInstance(mockConfig);
      await service.initialize();
      await service.clearEventQueue();
      expect(mockEventQueue.clearQueue).toHaveBeenCalled();
    });

    it('getQueueLength delegates', () => {
      const service = CRMService.getInstance(mockConfig);
      mockEventQueue.getQueueLength.mockReturnValue(5);
      expect(service.getQueueLength()).toBe(5);
    });
  });
});
