import AsyncStorage from '@react-native-async-storage/async-storage';
import { asyncStoragePersister } from '@/services/query-persister';

describe('asyncStoragePersister', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('persistClient stores data', async () => {
    await asyncStoragePersister.persistClient({ queries: [] });
    const stored = await AsyncStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual({ queries: [] });
  });

  it('restoreClient returns stored data', async () => {
    const data = { queries: [{ id: 1 }] };
    await AsyncStorage.setItem('REACT_QUERY_OFFLINE_CACHE', JSON.stringify(data));
    const result = await asyncStoragePersister.restoreClient();
    expect(result).toEqual(data);
  });

  it('restoreClient returns undefined when empty', async () => {
    const result = await asyncStoragePersister.restoreClient();
    expect(result).toBeUndefined();
  });

  it('removeClient clears stored data', async () => {
    await asyncStoragePersister.persistClient({ queries: [] });
    await asyncStoragePersister.removeClient();
    const stored = await AsyncStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
    expect(stored).toBeNull();
  });

  it('persistClient handles errors gracefully', async () => {
    const spy = jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('fail'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    await asyncStoragePersister.persistClient({ data: true });
    // Should not throw
    spy.mockRestore();
    warnSpy.mockRestore();
  });

  it('restoreClient handles errors gracefully', async () => {
    const spy = jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('fail'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const result = await asyncStoragePersister.restoreClient();
    expect(result).toBeUndefined();
    spy.mockRestore();
    warnSpy.mockRestore();
  });

  it('removeClient handles errors gracefully', async () => {
    const spy = jest.spyOn(AsyncStorage, 'removeItem').mockRejectedValueOnce(new Error('fail'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    await asyncStoragePersister.removeClient();
    spy.mockRestore();
    warnSpy.mockRestore();
  });

  it('persistClient serializes data as JSON', async () => {
    const data = { queries: [{ key: ['users'], data: { name: 'Test' } }] };
    await asyncStoragePersister.persistClient(data);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'REACT_QUERY_OFFLINE_CACHE',
      JSON.stringify(data)
    );
  });
});
