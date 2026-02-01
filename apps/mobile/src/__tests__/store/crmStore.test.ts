import { useCRMStore } from '@/store/crmStore';

describe('crmStore', () => {
  beforeEach(() => {
    useCRMStore.getState().reset();
  });

  it('has correct initial state', () => {
    const state = useCRMStore.getState();
    expect(state.isOnline).toBe(true);
    expect(state.isInitialized).toBe(false);
    expect(state.queueLength).toBe(0);
    expect(state.lastSyncAt).toBeNull();
    expect(state.errors).toEqual([]);
    expect(state.currentContactId).toBeNull();
  });

  it('setOnline updates online status', () => {
    useCRMStore.getState().setOnline(false);
    expect(useCRMStore.getState().isOnline).toBe(false);
  });

  it('setInitialized updates flag', () => {
    useCRMStore.getState().setInitialized(true);
    expect(useCRMStore.getState().isInitialized).toBe(true);
  });

  it('setQueueLength updates count', () => {
    useCRMStore.getState().setQueueLength(5);
    expect(useCRMStore.getState().queueLength).toBe(5);
  });

  it('setLastSyncAt updates timestamp', () => {
    useCRMStore.getState().setLastSyncAt('2024-01-01T00:00:00Z');
    expect(useCRMStore.getState().lastSyncAt).toBe('2024-01-01T00:00:00Z');
  });

  it('addError appends error', () => {
    useCRMStore.getState().addError('Error 1');
    expect(useCRMStore.getState().errors).toEqual(['Error 1']);
  });

  it('addError keeps max 10 errors', () => {
    for (let i = 0; i < 15; i++) {
      useCRMStore.getState().addError(`Error ${i}`);
    }
    expect(useCRMStore.getState().errors).toHaveLength(10);
    expect(useCRMStore.getState().errors[9]).toBe('Error 14');
  });

  it('clearErrors empties array', () => {
    useCRMStore.getState().addError('Error 1');
    useCRMStore.getState().clearErrors();
    expect(useCRMStore.getState().errors).toEqual([]);
  });

  it('setCurrentContactId updates contactId', () => {
    useCRMStore.getState().setCurrentContactId('contact-1');
    expect(useCRMStore.getState().currentContactId).toBe('contact-1');
  });

  it('updateSyncStatus updates multiple fields', () => {
    useCRMStore.getState().updateSyncStatus({
      isOnline: false,
      queueLength: 3,
      lastSyncAt: '2024-01-01T00:00:00Z',
      errors: ['err1'],
    });
    const state = useCRMStore.getState();
    expect(state.isOnline).toBe(false);
    expect(state.queueLength).toBe(3);
    expect(state.lastSyncAt).toBe('2024-01-01T00:00:00Z');
    expect(state.errors).toEqual(['err1']);
  });

  it('reset restores initial state', () => {
    useCRMStore.getState().setOnline(false);
    useCRMStore.getState().setInitialized(true);
    useCRMStore.getState().addError('err');
    useCRMStore.getState().reset();
    const state = useCRMStore.getState();
    expect(state.isOnline).toBe(true);
    expect(state.isInitialized).toBe(false);
    expect(state.errors).toEqual([]);
  });

  it('setCurrentContactId with null clears', () => {
    useCRMStore.getState().setCurrentContactId('c-1');
    useCRMStore.getState().setCurrentContactId(null);
    expect(useCRMStore.getState().currentContactId).toBeNull();
  });

  it('setLastSyncAt with null clears', () => {
    useCRMStore.getState().setLastSyncAt('2024-01-01T00:00:00Z');
    useCRMStore.getState().setLastSyncAt(null);
    expect(useCRMStore.getState().lastSyncAt).toBeNull();
  });

  it('updateSyncStatus handles undefined lastSyncAt', () => {
    useCRMStore.getState().updateSyncStatus({
      isOnline: true,
      queueLength: 0,
      errors: [],
    });
    expect(useCRMStore.getState().lastSyncAt).toBeNull();
  });
});
