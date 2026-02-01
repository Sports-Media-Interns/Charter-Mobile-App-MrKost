import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/utils/logger';

const QUERY_CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE';

export const asyncStoragePersister = {
  persistClient: async (client: unknown) => {
    try {
      await AsyncStorage.setItem(QUERY_CACHE_KEY, JSON.stringify(client));
    } catch (err) {
      logger.warn('Failed to persist query cache:', err);
    }
  },
  restoreClient: async () => {
    try {
      const cached = await AsyncStorage.getItem(QUERY_CACHE_KEY);
      return cached ? JSON.parse(cached) : undefined;
    } catch (err) {
      logger.warn('Failed to restore query cache:', err);
      return undefined;
    }
  },
  removeClient: async () => {
    try {
      await AsyncStorage.removeItem(QUERY_CACHE_KEY);
    } catch (err) {
      logger.warn('Failed to remove query cache:', err);
    }
  },
};
