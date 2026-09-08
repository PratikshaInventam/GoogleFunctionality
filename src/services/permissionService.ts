import { Platform, PermissionsAndroid, Linking, Alert } from 'react-native';

export type PermissionType = 'camera' | 'location';

export interface PermissionStatus {
  granted: boolean;
  blocked?: boolean;
}

/**
 * Checks if Camera permission is granted
 */
export const checkCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
    } catch {
      return false;
    }
  }
  return true; // iOS fallback
};

/**
 * Requests Camera permission from the user
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission Required',
          message:
            'Attendance Register needs front camera access to perform AI Face Verification & anti-spoofing liveness check.',
          buttonPositive: 'Allow Camera',
          buttonNegative: 'Deny',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }
  return true;
};

/**
 * Checks if GPS Location permission is granted
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
    } catch {
      return false;
    }
  }
  return true;
};

/**
 * Requests GPS Location permission from the user
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'GPS Location Permission',
          message:
            'Attendance Register requires your device location to verify proximity (≤ 500m) to the office.',
          buttonPositive: 'Allow Location',
          buttonNegative: 'Deny',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }
  return true;
};

/**
 * Opens system application settings so user can grant permissions if blocked
 */
export const openAppSettings = () => {
  Linking.openSettings().catch(() => {
    Alert.alert('Settings', 'Unable to open device settings automatically.');
  });
};
