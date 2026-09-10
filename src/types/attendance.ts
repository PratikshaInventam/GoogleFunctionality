import { PunchVerificationMode, PunchType } from './punchMode';
import { DeviceLocationCoordinates, AttendanceLocation } from './location';

export type PunchStatus =
  | 'idle'
  | 'checking_permission'
  | 'getting_location'
  | 'validating_location'
  | 'face_verification'
  | 'fingerprint_verification'
  | 'punching'
  | 'success'
  | 'outside_location'
  | 'error';

export interface PunchResultInfo {
  distanceMeters?: number;
  allowedRadiusMeters?: number;
  isWithinRadius?: boolean;
  userLocation?: DeviceLocationCoordinates;
  officeLocation?: AttendanceLocation;
  message?: string;
  verificationMethod?: PunchVerificationMode;
  punchType?: PunchType;
  timestamp?: string;
  biometricSignature?: string;
  biometricPayload?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  punchInTime?: string;
  punchOutTime?: string;
  punchType: PunchType;
  verificationMode: PunchVerificationMode;
  distanceFromOffice: number;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ON_DUTY' | 'REJECTED' | 'FAILED';
  locationName: string;
  userCoordinates?: DeviceLocationCoordinates;
  failureReason?: string;
  similarityScore?: number;
  biometricSignature?: string;
  biometricPayload?: string;
}
