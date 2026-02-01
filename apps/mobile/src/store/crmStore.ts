// CRM Store - Zustand store for CRM state

import { create } from 'zustand';
import { CRMSyncStatus } from '@/types/crm';

interface CRMState {
  isOnline: boolean;
  isInitialized: boolean;
  queueLength: number;
  lastSyncAt: string | null;
  errors: string[];
  currentContactId: string | null;

  // Actions
  setOnline: (isOnline: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setQueueLength: (length: number) => void;
  setLastSyncAt: (timestamp: string | null) => void;
  addError: (error: string) => void;
  clearErrors: () => void;
  setCurrentContactId: (contactId: string | null) => void;
  updateSyncStatus: (status: CRMSyncStatus) => void;
  reset: () => void;
}

const initialState = {
  isOnline: true,
  isInitialized: false,
  queueLength: 0,
  lastSyncAt: null,
  errors: [] as string[],
  currentContactId: null,
};

export const useCRMStore = create<CRMState>((set) => ({
  ...initialState,

  setOnline: (isOnline) => set({ isOnline }),

  setInitialized: (isInitialized) => set({ isInitialized }),

  setQueueLength: (queueLength) => set({ queueLength }),

  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),

  addError: (error) =>
    set((state) => ({
      errors: [...state.errors.slice(-9), error], // Keep last 10 errors
    })),

  clearErrors: () => set({ errors: [] }),

  setCurrentContactId: (currentContactId) => set({ currentContactId }),

  updateSyncStatus: (status) =>
    set({
      isOnline: status.isOnline,
      queueLength: status.queueLength,
      lastSyncAt: status.lastSyncAt || null,
      errors: status.errors,
    }),

  reset: () => set(initialState),
}));
