export interface AttendanceLocation {
  latitude: number;
  longitude: number;
  radius: number; // in meters (default 500m)
  name: string;
}

export interface DeviceLocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp?: number | string;
}

export interface ValidatedLocationInfo {
  userCoords: DeviceLocationCoordinates;
  officeLocation: AttendanceLocation;
  distanceMeters: number;
  allowedRadiusMeters: number;
  isWithinRadius: boolean;
}
