import { AttendanceRecord } from '../types/attendance';
import { PunchVerificationMode, PunchType } from '../types/punchMode';
import { DeviceLocationCoordinates } from '../types/location';

export const INITIAL_RECORDS: AttendanceRecord[] = [
  {
    id: 'REC-002',
    employeeId: 'EMP-1024',
    employeeName: 'Pratiksha Patel',
    date: 'Yesterday',
    punchInTime: '09:05 AM',
    punchOutTime: '06:35 PM',
    punchType: 'OUT',
    verificationMode: 'LOCATION_ONLY',
    distanceFromOffice: 78,
    status: 'PRESENT',
    locationName: 'Headquarters & Tech Center',
  },
  {
    id: 'REC-003',
    employeeId: 'EMP-1024',
    employeeName: 'Pratiksha Patel',
    date: '06 Sep 2026',
    punchInTime: '09:40 AM',
    punchOutTime: '06:30 PM',
    punchType: 'OUT',
    verificationMode: 'FINGERPRINT',
    distanceFromOffice: 110,
    status: 'LATE',
    locationName: 'Headquarters & Tech Center',
  },
];

export const submitPunchRecord = async (params: {
  employeeId: string;
  employeeName: string;
  punchType: PunchType;
  verificationMode: PunchVerificationMode;
  distanceFromOffice: number;
  locationName: string;
  userCoords?: DeviceLocationCoordinates;
}): Promise<AttendanceRecord> => {
  // Simulate API delay
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 800));

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const record: AttendanceRecord = {
    id: `REC-${Date.now().toString().slice(-4)}`,
    employeeId: params.employeeId,
    employeeName: params.employeeName,
    date: 'Today',
    punchInTime: params.punchType === 'IN' ? timeFormatted : undefined,
    punchOutTime: params.punchType === 'OUT' ? timeFormatted : undefined,
    punchType: params.punchType,
    verificationMode: params.verificationMode,
    distanceFromOffice: params.distanceFromOffice,
    status: 'PRESENT',
    locationName: params.locationName,
    userCoordinates: params.userCoords,
  };

  return record;
};
