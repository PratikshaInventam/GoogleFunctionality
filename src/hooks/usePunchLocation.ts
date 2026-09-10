import { useState, useCallback, useRef } from 'react';
import { PunchStatus, PunchResultInfo } from '../types/attendance';
import { PunchVerificationMode, PunchType } from '../types/punchMode';
import { ValidatedLocationInfo, AttendanceLocation } from '../types/location';
import {
  getCurrentDeviceLocation,
  validateOfficeProximity,
  DEFAULT_OFFICE,
} from '../services/locationService';
import {
  checkLocationPermission,
  requestLocationPermission,
} from '../services/permissionService';
import { submitPunchRecord } from '../services/attendanceService';
import { formatDistance } from '../utils/distanceUtils';

export interface UsePunchLocationOptions {
  officeLocation?: AttendanceLocation;
  employeeId?: string;
  employeeName?: string;
  onSuccess?: (record: any) => void;
}

export const usePunchLocation = (options?: UsePunchLocationOptions) => {
  const officeLocation = options?.officeLocation || DEFAULT_OFFICE;
  const employeeId = options?.employeeId || 'EMP-1024';
  const employeeName = options?.employeeName || 'Pratiksha Patel';

  const [status, setStatus] = useState<PunchStatus>('idle');
  const [currentPunchType, setCurrentPunchType] = useState<PunchType>('IN');
  const [lastResult, setLastResult] = useState<PunchResultInfo | null>(null);
  const [isFaceModalVisible, setIsFaceModalVisible] = useState(false);
  const [isFingerprintModalVisible, setIsFingerprintModalVisible] = useState(false);
  const [validatedLocationInfo, setValidatedLocationInfo] =
    useState<ValidatedLocationInfo | null>(null);
  const [isOutsideModalVisible, setIsOutsideModalVisible] = useState(false);

  const currentPunchTypeRef = useRef<PunchType>('IN');
  const validatedLocationRef = useRef<ValidatedLocationInfo | null>(null);

  const isPunching =
    status === 'checking_permission' ||
    status === 'getting_location' ||
    status === 'validating_location' ||
    status === 'face_verification' ||
    status === 'fingerprint_verification' ||
    status === 'punching';

  const isExecutingRef = useRef(false);

  /**
   * Finalizes and persists punch record
   */
  const submitPunch = useCallback(
    async (
      locInfo: ValidatedLocationInfo,
      mode: PunchVerificationMode,
      punchType: PunchType,
      signature?: string,
      payload?: string
    ) => {
      setStatus('punching');
      try {
        const record = await submitPunchRecord({
          employeeId,
          employeeName,
          punchType,
          verificationMode: mode,
          distanceFromOffice: locInfo.distanceMeters,
          locationName: locInfo.officeLocation.name,
          userCoords: locInfo.userCoords,
          biometricSignature: signature,
          biometricPayload: payload,
        });

        setStatus('success');
        setLastResult({
          distanceMeters: locInfo.distanceMeters,
          allowedRadiusMeters: locInfo.allowedRadiusMeters,
          isWithinRadius: true,
          userLocation: locInfo.userCoords,
          officeLocation: locInfo.officeLocation,
          message: `Punch ${punchType} Successful (${formatDistance(locInfo.distanceMeters)} away)`,
          verificationMethod: mode,
          punchType,
          timestamp: new Date().toLocaleTimeString(),
          biometricSignature: signature,
          biometricPayload: payload,
        });

        if (options?.onSuccess) {
          options.onSuccess(record);
        }

        setTimeout(() => {
          setStatus('idle');
        }, 1800);
      } catch (err: any) {
        setStatus('error');
        setLastResult({
          message: err?.message || 'Failed to submit punch. Please try again.',
        });
      } finally {
        isExecutingRef.current = false;
      }
    },
    [employeeId, employeeName, options]
  );

  /**
   * Primary entry point: starts GPS & Geofence workflow
   */
  const executePunch = useCallback(
    async (mode: PunchVerificationMode, punchType: PunchType = 'IN', simulateOutside = false) => {
      if (isExecutingRef.current) return;
      isExecutingRef.current = true;

      currentPunchTypeRef.current = punchType;
      setCurrentPunchType(punchType);
      setStatus('checking_permission');

      try {
        const hasPerm = await checkLocationPermission();
        if (!hasPerm) {
          const granted = await requestLocationPermission();
          if (!granted) {
            setStatus('error');
            setLastResult({
              message: 'Location permission was denied. Please allow GPS access to punch attendance.',
            });
            isExecutingRef.current = false;
            return;
          }
        }

        await new Promise<void>((r) => setTimeout(() => r(), 300));
        setStatus('getting_location');

        const userCoords = await getCurrentDeviceLocation(simulateOutside);
        setStatus('validating_location');

        const validation = validateOfficeProximity(userCoords, officeLocation);
        validatedLocationRef.current = validation;
        setValidatedLocationInfo(validation);

        if (!validation.isWithinRadius) {
          setStatus('outside_location');
          setLastResult({
            distanceMeters: validation.distanceMeters,
            allowedRadiusMeters: validation.allowedRadiusMeters,
            isWithinRadius: false,
            userLocation: userCoords,
            officeLocation,
            message: `You are ${formatDistance(
              validation.distanceMeters
            )} away. You must be within ${formatDistance(
              validation.allowedRadiusMeters
            )} of ${officeLocation.name} to punch.`,
          });
          setIsOutsideModalVisible(true);
          isExecutingRef.current = false;
          return;
        }

        // Inside geofence: Route based on verification mode
        if (mode === 'LOCATION_ONLY') {
          await submitPunch(validation, 'LOCATION_ONLY', punchType);
        } else if (mode === 'FACE') {
          setStatus('face_verification');
          setIsFaceModalVisible(true);
        } else if (mode === 'FINGERPRINT') {
          setStatus('fingerprint_verification');
          setIsFingerprintModalVisible(true);
        }
      } catch (err: any) {
        setStatus('error');
        setLastResult({
          message: err?.message || 'Location verification failed. Please try again.',
        });
        isExecutingRef.current = false;
      }
    },
    [officeLocation, submitPunch]
  );

  // Modal Handlers
  const handleFaceSuccess = useCallback(() => {
    setIsFaceModalVisible(false);
    const loc = validatedLocationRef.current || validatedLocationInfo;
    const pType = currentPunchTypeRef.current || currentPunchType;
    if (loc) {
      submitPunch(loc, 'FACE', pType);
    } else {
      isExecutingRef.current = false;
      setStatus('idle');
    }
  }, [validatedLocationInfo, currentPunchType, submitPunch]);

  const handleFaceFailed = useCallback((reason?: string, score?: number) => {
    setIsFaceModalVisible(false);
    setStatus('error');
    isExecutingRef.current = false;

    const pType = currentPunchTypeRef.current || currentPunchType;
    const loc = validatedLocationRef.current || validatedLocationInfo;

    const failedRecord = {
      id: `REC-FAIL-${Date.now().toString().slice(-4)}`,
      employeeId,
      employeeName,
      date: 'Today',
      punchInTime: pType === 'IN' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      punchOutTime: pType === 'OUT' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      punchType: pType,
      verificationMode: 'FACE' as const,
      distanceFromOffice: loc?.distanceMeters || 0,
      status: 'REJECTED' as const,
      locationName: loc?.officeLocation.name || 'Headquarters & Tech Center',
      failureReason: reason || (score ? `Face Mismatch (${(score * 100).toFixed(1)}% < 45%)` : 'Face Biometric Mismatch'),
      similarityScore: score,
    };

    if (options?.onSuccess) {
      options.onSuccess(failedRecord);
    }
  }, [employeeId, employeeName, currentPunchType, validatedLocationInfo, options]);

  const handleFingerprintSuccess = useCallback(
    (signature?: string, payload?: string) => {
      setIsFingerprintModalVisible(false);
      const loc = validatedLocationRef.current || validatedLocationInfo;
      const pType = currentPunchTypeRef.current || currentPunchType;
      if (loc) {
        submitPunch(loc, 'FINGERPRINT', pType, signature, payload);
      } else {
        isExecutingRef.current = false;
        setStatus('idle');
      }
    },
    [validatedLocationInfo, currentPunchType, submitPunch]
  );

  const handleFingerprintFailed = useCallback(() => {
    setIsFingerprintModalVisible(false);
    setStatus('error');
    isExecutingRef.current = false;
  }, []);

  const closeFaceModal = useCallback(() => {
    setIsFaceModalVisible(false);
    setStatus('idle');
    isExecutingRef.current = false;
  }, []);

  const closeFingerprintModal = useCallback(() => {
    setIsFingerprintModalVisible(false);
    setStatus('idle');
    isExecutingRef.current = false;
  }, []);

  const closeOutsideModal = useCallback(() => {
    setIsOutsideModalVisible(false);
    setStatus('idle');
  }, []);

  return {
    status,
    isPunching,
    currentPunchType,
    lastResult,
    executePunch,
    isFaceModalVisible,
    isFingerprintModalVisible,
    isOutsideModalVisible,
    validatedLocationInfo,
    handleFaceSuccess,
    handleFaceFailed,
    handleFingerprintSuccess,
    handleFingerprintFailed,
    closeFaceModal,
    closeFingerprintModal,
    closeOutsideModal,
    employeeId,
    employeeName,
  };
};
