import { AttendanceLocation, DeviceLocationCoordinates } from '../types/location';

export const DEFAULT_ATTENDANCE_RADIUS_METERS = 500;
export const MAX_ACCEPTABLE_ACCURACY_METERS = 100;
const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Calculates the great-circle distance between two GPS coordinates using the Haversine formula.
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number' ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return Infinity;
  }

  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_METERS * c;

  return Math.round(distance);
};

export const isWithinRadius = (
  distanceInMeters: number,
  allowedRadius: number = DEFAULT_ATTENDANCE_RADIUS_METERS
): boolean => {
  if (typeof distanceInMeters !== 'number' || isNaN(distanceInMeters)) {
    return false;
  }
  return distanceInMeters <= allowedRadius;
};

export const formatDistance = (meters: number): string => {
  if (typeof meters !== 'number' || isNaN(meters)) return '—';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};
