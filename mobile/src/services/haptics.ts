import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { FEATURES } from '../config/constants';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const HapticService = {
  // Light impact - for UI interactions
  light: () => {
    if (!FEATURES.HAPTIC_FEEDBACK) return;
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
  },

  // Medium impact - for game actions
  medium: () => {
    if (!FEATURES.HAPTIC_FEEDBACK) return;
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
  },

  // Heavy impact - for significant events
  heavy: () => {
    if (!FEATURES.HAPTIC_FEEDBACK) return;
    ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
  },

  // Success feedback
  success: () => {
    if (!FEATURES.HAPTIC_FEEDBACK) return;
    ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
  },

  // Warning feedback
  warning: () => {
    if (!FEATURES.HAPTIC_FEEDBACK) return;
    ReactNativeHapticFeedback.trigger('notificationWarning', hapticOptions);
  },

  // Error feedback
  error: () => {
    if (!FEATURES.HAPTIC_FEEDBACK) return;
    ReactNativeHapticFeedback.trigger('notificationError', hapticOptions);
  },

  // Selection feedback - for scrolling or selecting
  selection: () => {
    if (!FEATURES.HAPTIC_FEEDBACK) return;
    ReactNativeHapticFeedback.trigger('selection', hapticOptions);
  },

  // Game-specific haptics
  eatFood: () => {
    HapticService.medium();
  },

  gameOver: () => {
    HapticService.error();
  },

  victory: () => {
    HapticService.success();
  },

  directionChange: () => {
    HapticService.light();
  },

  achievementUnlocked: () => {
    HapticService.heavy();
  },
};

export default HapticService;
