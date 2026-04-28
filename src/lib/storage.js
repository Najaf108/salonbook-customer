// src/lib/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = {
  async get(key) {
    try {
      const val = await AsyncStorage.getItem(key);
      if (!val) {
        console.log(`[Storage] GET ${key}: MISSING`);
        return null;
      }
      try {
        const parsed = JSON.parse(val);
        console.log(`[Storage] GET ${key}: Found JSON`);
        return parsed;
      } catch {
        console.log(`[Storage] GET ${key}: Found Raw String`);
        return val;
      }
    } catch (err) {
      console.error(`[Storage] GET ${key} Error:`, err.message);
      return null;
    }
  },
  async set(key, value) {
    try {
      console.log(`[Storage] SET ${key}: Saving...`);
      await AsyncStorage.setItem(key, JSON.stringify(value));
      console.log(`[Storage] SET ${key}: SUCCESS`);
    } catch (err) {
      console.error(`[Storage] SET ${key} Error:`, err.message);
    }
  },
  async delete(key) {
    try {
      console.log(`[Storage] DELETE ${key}`);
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.error(`[Storage] DELETE ${key} Error:`, err.message);
    }
  },
  async clear() {
    try { await AsyncStorage.clear(); } catch { }
  },
};

export default storage;