import { DeviceLocationCoordinates, AttendanceLocation } from '../types/location';
import { calculateDistance, isWithinRadius } from '../utils/distanceUtils';

// Default Office Coordinates (e.g., Surat Tech Hub)
export const DEFAULT_OFFICE: AttendanceLocation = {
  latitude: 21.196171,
  longitude: 72.780000,
  radius: 500,
  name: 'Headquarters & Tech Center',
};

/**
 * Simulates fetching GPS device location or obtaining coordinates.
 * Returns realistic coordinates close to the office with slight random jitter.
 */
export const getCurrentDeviceLocation = async (simulateOutside = false): Promise<DeviceLocationCoordinates> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (simulateOutside) {
        // Generates coordinates ~2.5km away (outside 500m geofence)
        resolve({
          latitude: DEFAULT_OFFICE.latitude + 0.022,
          longitude: DEFAULT_OFFICE.longitude + 0.022,
          accuracy: 12,
          timestamp: Date.now(),
        });
      } else {
        // Generates coordinates ~60-120m away (inside 500m geofence)
        const jitterLat = (Math.random() - 0.5) * 0.0009;
        const jitterLon = (Math.random() - 0.5) * 0.0009;
        resolve({
          latitude: DEFAULT_OFFICE.latitude + jitterLat,
          longitude: DEFAULT_OFFICE.longitude + jitterLon,
          accuracy: 8,
          timestamp: Date.now(),
        });
      }
    }, 900);
  });
};

/**
 * Validates device location against targeted office geofence.
 */
export const validateOfficeProximity = (
  userCoords: DeviceLocationCoordinates,
  officeLocation: AttendanceLocation = DEFAULT_OFFICE
) => {
  const distance = calculateDistance(
    userCoords.latitude,
    userCoords.longitude,
    officeLocation.latitude,
    officeLocation.longitude
  );

  const isValid = isWithinRadius(distance, officeLocation.radius);

  return {
    isWithinRadius: isValid,
    distanceMeters: distance,
    allowedRadiusMeters: officeLocation.radius,
    userCoords,
    officeLocation,
  };
};
