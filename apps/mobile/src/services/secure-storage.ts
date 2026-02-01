import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

let SecureStore: typeof import("expo-secure-store") | null = null;

// Dynamically import expo-secure-store only on native platforms
if (Platform.OS !== "web") {
  try {
    SecureStore = require("expo-secure-store");
  } catch {
    // expo-secure-store not available, fall back to AsyncStorage
  }
}

export const SecureStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return typeof localStorage !== "undefined"
        ? localStorage.getItem(key)
        : null;
    }
    if (SecureStore) {
      return SecureStore.getItemAsync(key);
    }
    return AsyncStorage.getItem(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
      return;
    }
    if (SecureStore) {
      return SecureStore.setItemAsync(key, value);
    }
    await AsyncStorage.setItem(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
      return;
    }
    if (SecureStore) {
      return SecureStore.deleteItemAsync(key);
    }
    await AsyncStorage.removeItem(key);
  },
};
