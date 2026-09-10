import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '../utils/theme';
import { AppIcon } from './AppIcon';
import { EmployeeFaceProfile } from '../services/faceBiometricService';
import {
  checkDeviceBiometricsAvailable,
  openDeviceSecuritySettings,
} from '../services/deviceBiometricService';

export interface BiometricEnrollmentModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenFaceEnrollment: () => void;
  faceProfile: EmployeeFaceProfile | null;
  employeeName?: string;
}

export const BiometricEnrollmentModal: React.FC<BiometricEnrollmentModalProps> = ({
  visible,
  onClose,
  onOpenFaceEnrollment,
  faceProfile,
  employeeName = 'Pratiksha Patel',
}) => {
  const [isFingerprintEnrolled, setIsFingerprintEnrolled] = useState<boolean>(false);
  const [biometryType, setBiometryType] = useState<string>('Fingerprint');

  const checkFingerprintStatus = async () => {
    const status = await checkDeviceBiometricsAvailable();
    setIsFingerprintEnrolled(status.available);
    if (status.biometryType) {
      setBiometryType(status.biometryType);
    }
  };

  useEffect(() => {
    if (visible) {
      checkFingerprintStatus();
    }
  }, [visible]);

  const handleFingerprintSettingClick = async () => {
    try {
      await openDeviceSecuritySettings();
    } catch (error) {
      console.error('[BiometricEnrollmentModal] openDeviceSecuritySettings error:', error);
    }
  };

  if (!visible) return null;

  const isFaceEnrolled = Boolean(faceProfile && faceProfile.face_registered);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropDismiss}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.card}>
          {/* Top Bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          <View style={styles.headerRow}>
            <View style={styles.headerIconCircle}>
              <AppIcon name="shield" size={20} color={theme.colors.cyan} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Biometric Enrollment</Text>
              <Text style={styles.headerSubtitle}>
                Manage Face ID & Device Fingerprint for {employeeName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Option 1: Face Biometric Enrollment */}
          {/* <View style={styles.optionCard}>
            <View style={styles.optionTop}>
              <View
                style={[
                  styles.optionIconCircle,
                  {
                    backgroundColor: isFaceEnrolled ? '#10B9811A' : '#F59E0B1A',
                  },
                ]}
              >
                <AppIcon
                  name="camera"
                  size={20}
                  color={isFaceEnrolled ? theme.colors.success : theme.colors.warning}
                />
              </View>

              <View style={styles.optionTextCol}>
                <View style={styles.optionTitleRow}>
                  <Text style={styles.optionTitle}>Face Biometrics (AI)</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isFaceEnrolled ? '#10B98120' : '#F59E0B20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: isFaceEnrolled ? '#10B981' : '#F59E0B' },
                      ]}
                    >
                      {isFaceEnrolled ? 'Enrolled ✓' : 'Not Enrolled'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.optionDescription}>
                  {isFaceEnrolled
                    ? '128D AI Face template with anti-spoofing liveness active.'
                    : 'Scan your face with live camera to register employee face profile.'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                !isFaceEnrolled
                  ? { backgroundColor: theme.colors.primaryLight }
                  : { backgroundColor: theme.colors.surfaceLight, borderColor: theme.colors.borderLight },
              ]}
              onPress={() => {
                onClose();
                onOpenFaceEnrollment();
              }}
              activeOpacity={0.8}
            >
              <AppIcon
                name="camera"
                size={14}
                color={!isFaceEnrolled ? '#FFFFFF' : theme.colors.text}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  !isFaceEnrolled ? { color: '#FFFFFF' } : { color: theme.colors.text },
                ]}
              >
                {isFaceEnrolled ? 'Re-Enroll Face Profile' : 'Enroll Face Now'}
              </Text>
            </TouchableOpacity>
          </View> */}

          {/* Option 2: Fingerprint Biometric Enrollment */}
          <View style={styles.optionCard}>
            <View style={styles.optionTop}>
              <View
                style={[
                  styles.optionIconCircle,
                  {
                    backgroundColor: isFingerprintEnrolled ? '#10B9811A' : '#8B5CF61A',
                  },
                ]}
              >
                <AppIcon
                  name="fingerprint"
                  size={20}
                  color={isFingerprintEnrolled ? theme.colors.success : theme.colors.purple}
                />
              </View>

              <View style={styles.optionTextCol}>
                <View style={styles.optionTitleRow}>
                  <Text style={styles.optionTitle}>Phone {biometryType}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isFingerprintEnrolled ? '#10B98120' : '#8B5CF620',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: isFingerprintEnrolled ? '#10B981' : theme.colors.purple },
                      ]}
                    >
                      {isFingerprintEnrolled ? 'Device Ready ✓' : 'Settings Required'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.optionDescription}>
                  {isFingerprintEnrolled
                    ? 'Device sensor active. You can register multiple fingers in Phone Settings.'
                    : 'No fingerprint found. Add your fingerprint in Phone Settings to use.'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                !isFingerprintEnrolled
                  ? { backgroundColor: theme.colors.purple }
                  : { backgroundColor: theme.colors.surfaceLight, borderColor: theme.colors.borderLight },
              ]}
              onPress={handleFingerprintSettingClick}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 13 }}>⚙️</Text>
              <Text
                style={[
                  styles.actionBtnText,
                  !isFingerprintEnrolled ? { color: '#FFFFFF' } : { color: theme.colors.text },
                ]}
              >
                {isFingerprintEnrolled
                  ? '⚙️ Add / Manage Fingerprints in Settings'
                  : '⚙️ Open Settings to Add Fingerprint'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Done Button */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  backdropDismiss: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handleBar: {
    width: 38,
    height: 4,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
    gap: 12,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.cyan + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  optionCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  optionTop: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  optionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  optionDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
});
