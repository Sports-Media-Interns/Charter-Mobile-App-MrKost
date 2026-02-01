// CRM Provider - React context and initialization for CRM

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { CRMService } from '@/services/crm';
import { getCRMConfig, isCRMEnabled } from '@/config/crm';
import { useCRMStore } from '@/store/crmStore';
import { useAuthStore } from '@/store/authStore';

interface CRMContextValue {
  isEnabled: boolean;
  isInitialized: boolean;
  isOnline: boolean;
  queueLength: number;
  forceSync: () => Promise<void>;
}

const CRMContext = createContext<CRMContextValue>({
  isEnabled: false,
  isInitialized: false,
  isOnline: true,
  queueLength: 0,
  forceSync: async () => {},
});

interface CRMProviderProps {
  children: ReactNode;
}

export function CRMProvider({ children }: CRMProviderProps) {
  const { profile } = useAuthStore();
  const {
    isInitialized,
    isOnline,
    queueLength,
    setInitialized,
    setOnline,
    setQueueLength,
    setCurrentContactId,
    updateSyncStatus,
  } = useCRMStore();

  const isEnabled = isCRMEnabled();

  // Initialize CRM service
  useEffect(() => {
    if (!isEnabled) return;

    const initializeCRM = async () => {
      try {
        const config = getCRMConfig();
        const service = CRMService.getInstance(config);
        await service.initialize();
        setInitialized(true);

        // Update store with initial status
        const status = service.getSyncStatus();
        updateSyncStatus(status);
      } catch (error) {
        console.warn('Failed to initialize CRM:', error);
        setInitialized(false);
      }
    };

    initializeCRM();

    return () => {
      CRMService.destroyInstance();
      setInitialized(false);
    };
  }, [isEnabled, setInitialized, updateSyncStatus]);

  // Identify user when profile changes
  useEffect(() => {
    if (!isEnabled || !isInitialized || !profile) return;

    const identifyUser = async () => {
      try {
        const service = CRMService.getInstance();
        const contactId = await service.identifyUser(profile);
        setCurrentContactId(contactId);
      } catch (error) {
        console.warn('Failed to identify user in CRM:', error);
      }
    };

    identifyUser();
  }, [isEnabled, isInitialized, profile, setCurrentContactId]);

  // Handle app state changes
  useEffect(() => {
    if (!isEnabled || !isInitialized) return;

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      try {
        const service = CRMService.getInstance();

        if (nextAppState === 'active') {
          await service.trackEvent('app_foregrounded');
          service.forceSync();
        } else if (nextAppState === 'background') {
          await service.trackEvent('app_backgrounded');
        }
      } catch (error) {
        console.warn('Failed to track app state:', error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isEnabled, isInitialized]);

  // Periodic status update
  useEffect(() => {
    if (!isEnabled || !isInitialized) return;

    const updateStatus = () => {
      try {
        const service = CRMService.getInstance();
        const status = service.getSyncStatus();
        updateSyncStatus(status);
        setQueueLength(service.getQueueLength());
      } catch (error) {
        // Service might not be initialized
      }
    };

    const interval = setInterval(updateStatus, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [isEnabled, isInitialized, updateSyncStatus, setQueueLength]);

  const forceSync = useCallback(async () => {
    if (!isEnabled || !isInitialized) return;

    try {
      const service = CRMService.getInstance();
      await service.forceSync();

      const status = service.getSyncStatus();
      updateSyncStatus(status);
    } catch (error) {
      console.warn('Failed to force sync:', error);
    }
  }, [isEnabled, isInitialized, updateSyncStatus]);

  const value: CRMContextValue = {
    isEnabled,
    isInitialized,
    isOnline,
    queueLength,
    forceSync,
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
}

export function useCRM(): CRMContextValue {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
