import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Platform } from 'react-native';
import StorageService from './storage';
import { FEATURES } from '../config/constants';

const rnBiometrics = new ReactNativeBiometrics();

export const BiometricService = {
  // Check if biometric authentication is available
  checkAvailability: async (): Promise<{
    available: boolean;
    biometryType?: typeof BiometryTypes[keyof typeof BiometryTypes];
  }> => {
    if (!FEATURES.BIOMETRIC_AUTH) {
      return { available: false };
    }

    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      return { available, biometryType };
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      return { available: false };
    }
  },

  // Get biometric type name for display
  getBiometricTypeName: (biometryType?: typeof BiometryTypes[keyof typeof BiometryTypes]): string => {
    switch (biometryType) {
      case BiometryTypes.FaceID:
        return 'Face ID';
      case BiometryTypes.TouchID:
        return 'Touch ID';
      case BiometryTypes.Biometrics:
        return Platform.OS === 'android' ? 'Fingerprint' : 'Biometrics';
      default:
        return 'Biometric Authentication';
    }
  },

  // Authenticate user with biometrics
  authenticate: async (promptMessage?: string): Promise<boolean> => {
    if (!FEATURES.BIOMETRIC_AUTH) {
      return false;
    }

    try {
      const { available } = await BiometricService.checkAvailability();
      if (!available) {
        console.log('Biometric authentication not available');
        return false;
      }

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: promptMessage || 'Authenticate to continue',
        cancelButtonText: 'Cancel',
      });

      return success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  },

  // Enable biometric authentication for the app
  enable: async (): Promise<boolean> => {
    try {
      const { available } = await BiometricService.checkAvailability();
      if (!available) {
        return false;
      }

      // Create keys for biometric authentication
      const { publicKey } = await rnBiometrics.createKeys();

      // Store the public key securely
      StorageService.set('biometric_public_key', publicKey);
      StorageService.setBiometricEnabled(true);

      return true;
    } catch (error) {
      console.error('Failed to enable biometric authentication:', error);
      return false;
    }
  },

  // Disable biometric authentication
  disable: async (): Promise<void> => {
    try {
      await rnBiometrics.deleteKeys();
      StorageService.remove('biometric_public_key');
      StorageService.setBiometricEnabled(false);
    } catch (error) {
      console.error('Failed to disable biometric authentication:', error);
    }
  },

  // Check if biometric is enabled for the app
  isEnabled: (): boolean => {
    return StorageService.getBiometricEnabled();
  },

  // Create signature (for secure transactions)
  createSignature: async (payload: string): Promise<string | null> => {
    try {
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage: 'Authenticate to sign transaction',
        payload: payload,
      });

      if (success && signature) {
        return signature;
      }
      return null;
    } catch (error) {
      console.error('Failed to create signature:', error);
      return null;
    }
  },
};

export default BiometricService;
