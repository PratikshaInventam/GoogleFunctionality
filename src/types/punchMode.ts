export type PunchVerificationMode = 'LOCATION_ONLY' | 'FACE' | 'FINGERPRINT';

export type PunchType = 'IN' | 'OUT';

export interface PunchModeOption {
  id: PunchVerificationMode;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor: string;
  iconName: string;
}

export const PUNCH_MODE_OPTIONS: PunchModeOption[] = [
  {
    id: 'LOCATION_ONLY',
    title: 'Location Only',
    subtitle: 'Verify office proximity (≤ 500m) and record punch directly',
    badgeText: 'Fastest',
    badgeColor: '#0284C7',
    iconName: 'location-pin',
  },
  {
    id: 'FACE',
    title: 'Face Recognition',
    subtitle: 'GPS proximity + live front camera anti-spoofing liveness check',
    badgeText: 'Recommended',
    badgeColor: '#10B981',
    iconName: 'camera',
  },
  {
    id: 'FINGERPRINT',
    title: 'Fingerprint Biometric',
    subtitle: 'GPS proximity + device biometric / fingerprint sensor',
    badgeText: 'Secure',
    badgeColor: '#8B5CF6',
    iconName: 'fingerprint',
  },
];
