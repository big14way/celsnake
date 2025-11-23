import { useCallback } from 'react';
import AnalyticsService from '../services/analytics';

export const useAnalytics = () => {
  const logScreenView = useCallback((screenName: string) => {
    AnalyticsService.logScreenView(screenName);
  }, []);

  const logEvent = useCallback((eventName: string, params?: { [key: string]: any }) => {
    AnalyticsService.logEvent(eventName, params);
  }, []);

  const logGameStart = useCallback((mode: 'single' | 'multi' | 'tournament') => {
    AnalyticsService.logGameStart(mode);
  }, []);

  const logGameEnd = useCallback((score: number, duration: number, mode: string) => {
    AnalyticsService.logGameEnd(score, duration, mode);
  }, []);

  const logAchievementUnlocked = useCallback((achievementId: string) => {
    AnalyticsService.logAchievementUnlocked(achievementId);
  }, []);

  const logWalletConnected = useCallback((provider: string) => {
    AnalyticsService.logWalletConnected(provider);
  }, []);

  const logTransaction = useCallback((type: string, value: string) => {
    AnalyticsService.logTransaction(type, value);
  }, []);

  const setUserProperties = useCallback((properties: { [key: string]: string }) => {
    AnalyticsService.setUserProperties(properties);
  }, []);

  const setUserId = useCallback((userId: string) => {
    AnalyticsService.setUserId(userId);
  }, []);

  return {
    logScreenView,
    logEvent,
    logGameStart,
    logGameEnd,
    logAchievementUnlocked,
    logWalletConnected,
    logTransaction,
    setUserProperties,
    setUserId,
  };
};
