import { MMKV } from 'react-native-mmkv';
import { STORAGE_KEYS } from '../config/constants';

// Initialize MMKV storage instance
export const storage = new MMKV({
  id: 'celo-snake-storage',
  encryptionKey: 'celo-snake-encryption-key', // In production, use a secure key management solution
});

// Storage service with type-safe methods
export const StorageService = {
  // Generic methods
  set: (key: string, value: any) => {
    storage.set(key, JSON.stringify(value));
  },

  get: <T>(key: string): T | null => {
    const value = storage.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  remove: (key: string) => {
    storage.delete(key);
  },

  clear: () => {
    storage.clearAll();
  },

  // Specific methods for common data
  setWalletAddress: (address: string) => {
    storage.set(STORAGE_KEYS.WALLET_ADDRESS, address);
  },

  getWalletAddress: (): string | null => {
    return storage.getString(STORAGE_KEYS.WALLET_ADDRESS) || null;
  },

  setUserProfile: (profile: any) => {
    storage.set(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  getUserProfile: () => {
    const profile = storage.getString(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  },

  setGameStats: (stats: any) => {
    storage.set(STORAGE_KEYS.GAME_STATS, JSON.stringify(stats));
  },

  getGameStats: () => {
    const stats = storage.getString(STORAGE_KEYS.GAME_STATS);
    return stats ? JSON.parse(stats) : null;
  },

  setAchievements: (achievements: any[]) => {
    storage.set(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  },

  getAchievements: () => {
    const achievements = storage.getString(STORAGE_KEYS.ACHIEVEMENTS);
    return achievements ? JSON.parse(achievements) : [];
  },

  setCachedGames: (games: any[]) => {
    storage.set(STORAGE_KEYS.CACHED_GAMES, JSON.stringify(games));
  },

  getCachedGames: () => {
    const games = storage.getString(STORAGE_KEYS.CACHED_GAMES);
    return games ? JSON.parse(games) : [];
  },

  setBiometricEnabled: (enabled: boolean) => {
    storage.set(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled);
  },

  getBiometricEnabled: (): boolean => {
    return storage.getBoolean(STORAGE_KEYS.BIOMETRIC_ENABLED) || false;
  },
};

export default StorageService;
