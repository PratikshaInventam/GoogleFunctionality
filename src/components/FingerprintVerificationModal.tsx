import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { theme } from '../utils/theme';
import { AppIcon } from './AppIcon';
import { ValidatedLocationInfo } from '../types/location';
import { formatDistance } from '../utils/distanceUtils';
import {
  promptDeviceBiometricAuth,
  checkDeviceBiometricsAvailable,
  openDeviceSecuritySettings,
} from '../services/deviceBiometricService';

export interface FingerprintVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onVerificationSuccess: (signature?: string, payload?: string) => void;
  onVerificationFailed: () => void;
  employeeName?: string;
  validatedLocation?: ValidatedLocationInfo;
}

export const FingerprintVerificationModal: React.FC<
  FingerprintVerificationModalProps
> = ({
  visible,
  onClose,
  onVerificationSuccess,
  onVerificationFailed,
  employeeName = 'Pratiksha Patel',
  validatedLocation,
}) => {
  const [state, setState] = useState<'IDLE' | 'PROMPTING' | 'SUCCESS' | 'ERROR' | 'NOT_ENROLLED'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [biometryType, setBiometryType] = useState<string>('Fingerprint');

  const radarAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const showEnrollmentAlert = () => {
    Alert.alert(
      'No Fingerprint Enrolled',
      'You have not added a fingerprint to this device. Please register your fingerprint in Phone Settings to use biometric attendance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            openDeviceSecuritySettings();
          },
        },
      ]
    );
  };

  const triggerBiometricScan = async () => {
    try {
      setState('PROMPTING');
      setErrorMessage(null);

      // 1. Check if hardware biometric is available and enrolled
      const availability = await checkDeviceBiometricsAvailable();
      if (availability.biometryType) {
        setBiometryType(availability.biometryType);
      }

      if (!availability.available) {
        setState('NOT_ENROLLED');
        setErrorMessage(
          'No fingerprint registered on this phone. Please add a fingerprint in Phone Settings.'
        );
        showEnrollmentAlert();
        return;
      }

      // Unique challenge payload tied to employee + timestamp + location
      const payloadChallenge = `ATTENDANCE_${employeeName.replace(/\s+/g, '_')}_${Date.now()}`;

      // 2. Prompt physical phone hardware sensor & sign with Keystore
      const result = await promptDeviceBiometricAuth(
        `Verify attendance for ${employeeName}`,
        payloadChallenge
      );

      if (result.success) {
        setState('SUCCESS');
        setTimeout(() => {
          onVerificationSuccess(result.signature, result.payload);
        }, 900);
      } else {
        if (result.isNotEnrolled) {
          setState('NOT_ENROLLED');
          setErrorMessage(
            'No fingerprint registered on this phone. Please add a fingerprint in Phone Settings.'
          );
          showEnrollmentAlert();
        } else {
          setState('ERROR');
          setErrorMessage(
            result.error || 'Fingerprint not recognized. Only enrolled fingers can punch in.'
          );
        }
      }
    } catch (err: any) {
      console.error('[FingerprintModal] Biometric scan error:', err);
      setState('ERROR');
      setErrorMessage(err.message || 'Biometric verification failed.');
    }
  };

  useEffect(() => {
    if (!visible) {
      setState('IDLE');
      setErrorMessage(null);
      return;
    }

    const radarLoop = Animated.loop(
      Animated.parallel([
        Animated.timing(radarAnim, {
          toValue: 1.4,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    radarLoop.start();

    // Trigger physical biometric prompt when modal opens
    const timer = setTimeout(() => {
      triggerBiometricScan();
    }, 400);

    return () => {
      radarLoop.stop();
      clearTimeout(timer);
    };
  }, [visible]);

  if (!visible) return null;

  const isNotEnrolled = state === 'NOT_ENROLLED';
  const isError = state === 'ERROR' || isNotEnrolled;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.liveDot,
                  isError && { backgroundColor: theme.colors.danger },
                  state === 'SUCCESS' && { backgroundColor: theme.colors.success },
                ]}
              />
              <Text
                style={[
                  styles.liveText,
                  isError && { color: theme.colors.danger },
                  state === 'SUCCESS' && { color: theme.colors.success },
                ]}
              >
                HARDWARE BIOMETRIC ({biometryType.toUpperCase()})
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.empTitle}>{employeeName}</Text>
          {validatedLocation && (
            <Text style={styles.locSubtitle}>
              GPS Verified ({formatDistance(validatedLocation.distanceMeters)} from office)
            </Text>
          )}

          {/* Biometric Sensor Icon / Scan Circle */}
          <View style={styles.sensorContainer}>
            {!isError && state !== 'SUCCESS' ? (
              <Animated.View
                style={[
                  styles.radarRing,
                  {
                    transform: [{ scale: radarAnim }],
                    opacity: opacityAnim,
                  },
                ]}
              />
            ) : null}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={isNotEnrolled ? openDeviceSecuritySettings : triggerBiometricScan}
              style={[
                styles.sensorCircle,
                state === 'SUCCESS' && styles.sensorCircleSuccess,
                isError && styles.sensorCircleError,
              ]}
            >
              {state === 'SUCCESS' ? (
                <AppIcon name="check" size={54} color={theme.colors.success} />
              ) : isError ? (
                <AppIcon name="alert-circle" size={50} color={theme.colors.danger} />
              ) : (
                <AppIcon name="fingerprint" size={54} color={theme.colors.purple} />
              )}
            </TouchableOpacity>
          </View>

          {/* Status Instruction Text */}
          <Text
            style={[
              styles.instructionText,
              isError && styles.errorInstructionText,
              state === 'SUCCESS' && styles.successInstructionText,
            ]}
          >
            {state === 'PROMPTING'
              ? 'Touch the phone fingerprint sensor...'
              : state === 'SUCCESS'
              ? 'Enrolled Fingerprint Verified!'
              : isNotEnrolled
              ? 'No Fingerprint Enrolled on Device'
              : state === 'ERROR'
              ? errorMessage || 'Fingerprint not recognized'
              : 'Tap sensor to scan fingerprint'}
          </Text>

          {isNotEnrolled ? (
            <Text style={styles.errorSubtext}>
              Please register your fingerprint in your phone's Security Settings to punch in.
            </Text>
          ) : state === 'ERROR' ? (
            <Text style={styles.errorSubtext}>
              Only fingers registered in your phone's lock screen settings are accepted. PIN/Pattern fallback is disabled.
            </Text>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            {isNotEnrolled ? (
              <TouchableOpacity
                style={styles.settingsBtn}
                onPress={openDeviceSecuritySettings}
                activeOpacity={0.8}
              >
                <Text style={styles.settingsBtnText}>⚙️ Open Settings</Text>
              </TouchableOpacity>
            ) : state === 'ERROR' ? (
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={triggerBiometricScan}
                activeOpacity={0.8}
              >
                <Text style={styles.retryBtnText}>Scan Again</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.scanBtn}
                onPress={triggerBiometricScan}
                activeOpacity={0.8}
              >
                <Text style={styles.scanBtnText}>Scan Sensor</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
    alignItems: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF61A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: theme.colors.purple,
  },
  liveText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: theme.colors.purple,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  empTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 4,
  },
  locSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sensorContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  radarRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: theme.colors.purple,
    backgroundColor: '#8B5CF615',
  },
  sensorCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.purple,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  sensorCircleSuccess: {
    borderColor: theme.colors.success,
    shadowColor: theme.colors.success,
  },
  sensorCircleError: {
    borderColor: theme.colors.danger,
    shadowColor: theme.colors.danger,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorInstructionText: {
    color: theme.colors.danger,
  },
  successInstructionText: {
    color: theme.colors.success,
  },
  errorSubtext: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
    lineHeight: 15,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  settingsBtn: {
    flex: 1.2,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
  },
  settingsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  retryBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scanBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: theme.colors.purple,
    alignItems: 'center',
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
