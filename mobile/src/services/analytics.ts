import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { FEATURES } from '../config/constants';

export const AnalyticsService = {
  // Initialize analytics
  init: async () => {
    if (!FEATURES.ANALYTICS) return;
    try {
      await analytics().setAnalyticsCollectionEnabled(true);
      console.log('Analytics initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  },

  // Log screen views
  logScreenView: async (screenName: string) => {
    if (!FEATURES.ANALYTICS) return;
    try {
      await analytics().logScreenView({
        screen_name: screenName,
        screen_class: screenName,
      });
    } catch (error) {
      console.error('Failed to log screen view:', error);
    }
  },

  // Log custom events
  logEvent: async (eventName: string, params?: { [key: string]: any }) => {
    if (!FEATURES.ANALYTICS) return;
    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  },

  // Game-specific events
  logGameStart: (mode: 'single' | 'multi' | 'tournament') => {
    AnalyticsService.logEvent('game_start', { game_mode: mode });
  },

  logGameEnd: (score: number, duration: number, mode: string) => {
    AnalyticsService.logEvent('game_end', {
      score,
      duration,
      game_mode: mode,
    });
  },

  logAchievementUnlocked: (achievementId: string) => {
    AnalyticsService.logEvent('achievement_unlocked', {
      achievement_id: achievementId,
    });
  },

  logWalletConnected: (provider: string) => {
    AnalyticsService.logEvent('wallet_connected', { provider });
  },

  logTransaction: (type: string, value: string) => {
    AnalyticsService.logEvent('transaction', { type, value });
  },

  // User properties
  setUserProperties: async (properties: { [key: string]: string }) => {
    if (!FEATURES.ANALYTICS) return;
    try {
      await analytics().setUserProperties(properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  },

  setUserId: async (userId: string) => {
    if (!FEATURES.ANALYTICS) return;
    try {
      await analytics().setUserId(userId);
      await crashlytics().setUserId(userId);
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  },
};

export const CrashlyticsService = {
  // Log errors
  recordError: async (error: Error, context?: string) => {
    try {
      await crashlytics().recordError(error);
      if (context) {
        await crashlytics().log(`Error context: ${context}`);
      }
    } catch (e) {
      console.error('Failed to record error:', e);
    }
  },

  // Log non-fatal errors
  log: async (message: string) => {
    try {
      await crashlytics().log(message);
    } catch (error) {
      console.error('Failed to log message:', error);
    }
  },

  // Set custom attributes
  setAttribute: async (key: string, value: string) => {
    try {
      await crashlytics().setAttribute(key, value);
    } catch (error) {
      console.error('Failed to set attribute:', error);
    }
  },
};

export default AnalyticsService;
