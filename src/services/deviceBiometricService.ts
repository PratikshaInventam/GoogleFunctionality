import { Linking, Platform, NativeModules } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const { FaceBiometricsNative } = NativeModules;

// allowDeviceCredentials: false ensures ONLY physical biometrics (fingerprint/face) are accepted
// and prevents fallback to PIN / Pattern lock screen codes
const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: false,
});

export interface BiometricAvailability {
  available: boolean;
  biometryType?: 'TouchID' | 'FaceID' | 'Biometrics' | string;
  error?: string;
  isNotEnrolled?: boolean;
}

export interface BiometricAuthResult {
  success: boolean;
  signature?: string;
  payload?: string;
  publicKey?: string;
  error?: string;
  isNotEnrolled?: boolean;
}

/**
 * Creates a public/private keypair in Android Keystore / iOS Secure Enclave.
 * The private key is strictly protected by biometric authentication.
 */
export const createBiometricKeys = async (): Promise<{
  success: boolean;
  publicKey?: string;
  error?: string;
}> => {
  try {
    const { publicKey } = await rnBiometrics.createKeys();
    console.log('[deviceBiometricService] Biometric Keystore key created successfully');
    return { success: true, publicKey };
  } catch (error: any) {
    console.warn('[deviceBiometricService] createKeys error:', error);
    return { success: false, error: error?.message || 'Failed to create biometric keys' };
  }
};

/**
 * Checks if biometric keys already exist in the hardware keystore
 */
export const biometricKeysExist = async (): Promise<boolean> => {
  try {
    const { keysExist } = await rnBiometrics.biometricKeysExist();
    return keysExist;
  } catch (error) {
    console.warn('[deviceBiometricService] biometricKeysExist check failed:', error);
    return false;
  }
};

/**
 * Deletes existing biometric keys from the Keystore
 */
export const deleteBiometricKeys = async (): Promise<boolean> => {
  try {
    const { keysDeleted } = await rnBiometrics.deleteKeys();
    return keysDeleted;
  } catch (error) {
    console.warn('[deviceBiometricService] deleteKeys failed:', error);
    return false;
  }
};

/**
 * Opens the device's Biometric / Security Settings screen
 * so the user can register/enroll their fingerprint.
 */
export const openDeviceSecuritySettings = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    try {
      if (FaceBiometricsNative && FaceBiometricsNative.openSecuritySettings) {
        await FaceBiometricsNative.openSecuritySettings();
        return;
      }
    } catch (e) {
      console.warn('[deviceBiometricService] Native openSecuritySettings error, falling back:', e);
    }

    try {
      await Linking.sendIntent('android.settings.LOCK_SCREEN_SETTINGS');
    } catch {
      try {
        await Linking.openSettings();
      } catch (err) {
        console.error('[deviceBiometricService] openDeviceSecuritySettings failed:', err);
      }
    }
  } else {
    // iOS: Open App / Security Settings
    await Linking.openSettings();
  }
};

/**
 * Check if the device has biometric hardware and enrolled fingerprints
 */
export const checkDeviceBiometricsAvailable = async (): Promise<BiometricAvailability> => {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();
    return {
      available,
      biometryType: biometryType || 'Biometrics',
      isNotEnrolled: !available,
    };
  } catch (error: any) {
    console.error('[deviceBiometricService] isSensorAvailable error:', error);
    const msg = error.message || '';
    const isNotEnrolled =
      msg.includes('not enrolled') ||
      msg.includes('enrolled') ||
      msg.includes('BIOMETRIC_ERROR_NONE_ENROLLED');
    return {
      available: false,
      error: error.message || 'No biometric hardware or fingerprints enrolled',
      isNotEnrolled,
    };
  }
};

/**
 * Prompt the phone's physical hardware biometric sensor (Android BiometricPrompt / iOS TouchID/FaceID).
 * If a payload is provided:
 * 1. Checks/creates cryptographic hardware keystore key.
 * 2. Asks Android Keystore to sign the payload upon valid fingerprint match.
 * 3. Returns a base64-encoded cryptographic signature proving physical biometric verification.
 * If signing fails or keys aren't supported, seamlessly falls back to simplePrompt.
 */
export const promptDeviceBiometricAuth = async (
  promptMessage: string = 'Scan your fingerprint to verify attendance',
  payload?: string
): Promise<BiometricAuthResult> => {
  try {
    // If payload is provided, attempt cryptographic signing
    if (payload) {
      let keysExist = await biometricKeysExist();
      if (!keysExist) {
        const keyResult = await createBiometricKeys();
        keysExist = keyResult.success;
      }

      if (keysExist) {
        try {
          const { success, signature, error } = await rnBiometrics.createSignature({
            promptMessage,
            payload,
            cancelButtonText: 'Cancel',
          });

          if (success && signature) {
            console.log('[deviceBiometricService] Biometric signature generated successfully');
            return {
              success: true,
              signature,
              payload,
            };
          } else if (error) {
            const errStr = error || '';
            const isNotEnrolled =
              errStr.toLowerCase().includes('enrolled') ||
              errStr.includes('BIOMETRIC_ERROR_NONE_ENROLLED');

            if (errStr.toLowerCase().includes('cancel') || isNotEnrolled) {
              return {
                success: false,
                error: error || 'Authentication cancelled',
                isNotEnrolled,
              };
            }
          }
        } catch (signErr: any) {
          console.warn('[deviceBiometricService] createSignature failed, falling back to simplePrompt:', signErr);
        }
      }
    }

    // Standard Biometric Prompt (Simple verification)
    const { success, error } = await rnBiometrics.simplePrompt({
      promptMessage,
      cancelButtonText: 'Cancel',
    });

    if (success) {
      return { success: true };
    } else {
      const errStr = error || '';
      const isNotEnrolled =
        errStr.toLowerCase().includes('enrolled') ||
        errStr.includes('BIOMETRIC_ERROR_NONE_ENROLLED');

      return {
        success: false,
        error: error || 'Biometric authentication was cancelled or not recognized',
        isNotEnrolled,
      };
    }
  } catch (error: any) {
    console.error('[deviceBiometricService] promptDeviceBiometricAuth error:', error);
    const errStr = error.message || '';
    const isNotEnrolled =
      errStr.toLowerCase().includes('enrolled') ||
      errStr.includes('BIOMETRIC_ERROR_NONE_ENROLLED');

    return {
      success: false,
      error: error.message || 'Hardware biometric verification failed',
      isNotEnrolled,
    };
  }
};
