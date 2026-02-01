import { Platform } from 'react-native';

describe('SecureStorageAdapter', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('getItem uses SecureStore on native', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'ios' },
    }));
    const SecureStore = require('expo-secure-store');
    SecureStore.getItemAsync.mockResolvedValue('value');
    const { SecureStorageAdapter } = require('@/services/secure-storage');
    const result = await SecureStorageAdapter.getItem('key');
    expect(result).toBe('value');
  });

  it('setItem uses SecureStore on native', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'ios' },
    }));
    const SecureStore = require('expo-secure-store');
    SecureStore.setItemAsync.mockResolvedValue(undefined);
    const { SecureStorageAdapter } = require('@/services/secure-storage');
    await SecureStorageAdapter.setItem('key', 'value');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('key', 'value');
  });

  it('removeItem uses SecureStore on native', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'ios' },
    }));
    const SecureStore = require('expo-secure-store');
    SecureStore.deleteItemAsync.mockResolvedValue(undefined);
    const { SecureStorageAdapter } = require('@/services/secure-storage');
    await SecureStorageAdapter.removeItem('key');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('key');
  });

  it('getItem uses localStorage on web', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'web' },
    }));
    const mockStorage = { getItem: jest.fn(() => 'web-value'), setItem: jest.fn(), removeItem: jest.fn() };
    Object.defineProperty(global, 'localStorage', { value: mockStorage, writable: true });
    const { SecureStorageAdapter } = require('@/services/secure-storage');
    const result = await SecureStorageAdapter.getItem('key');
    expect(result).toBe('web-value');
  });

  it('setItem uses localStorage on web', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'web' },
    }));
    const mockStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };
    Object.defineProperty(global, 'localStorage', { value: mockStorage, writable: true });
    const { SecureStorageAdapter } = require('@/services/secure-storage');
    await SecureStorageAdapter.setItem('key', 'value');
    expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value');
  });

  it('removeItem uses localStorage on web', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'web' },
    }));
    const mockStorage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };
    Object.defineProperty(global, 'localStorage', { value: mockStorage, writable: true });
    const { SecureStorageAdapter } = require('@/services/secure-storage');
    await SecureStorageAdapter.removeItem('key');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('key');
  });

  it('getItem returns null on web without localStorage', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'web' },
    }));
    Object.defineProperty(global, 'localStorage', { value: undefined, writable: true });
    const { SecureStorageAdapter } = require('@/services/secure-storage');
    const result = await SecureStorageAdapter.getItem('key');
    expect(result).toBeNull();
  });

  it('falls back to AsyncStorage when SecureStore unavailable', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'android' },
    }));
    jest.doMock('expo-secure-store', () => {
      throw new Error('Not available');
    });
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    AsyncStorage.getItem.mockResolvedValue('async-value');
    const { SecureStorageAdapter } = require('@/services/secure-storage');
    const result = await SecureStorageAdapter.getItem('key');
    expect(result).toBe('async-value');
  });

  it('setItem falls back to AsyncStorage', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'android' },
    }));
    jest.doMock('expo-secure-store', () => {
      throw new Error('Not available');
    });
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const { SecureStorageAdapter } = require('@/services/secure-storage');
    await SecureStorageAdapter.setItem('key', 'value');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('key', 'value');
  });

  it('removeItem falls back to AsyncStorage', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'android' },
    }));
    jest.doMock('expo-secure-store', () => {
      throw new Error('Not available');
    });
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const { SecureStorageAdapter } = require('@/services/secure-storage');
    await SecureStorageAdapter.removeItem('key');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('key');
  });
});
