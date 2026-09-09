import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  AppState,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../utils/theme';
import { AppIcon } from '../components/AppIcon';
import { PunchInButton } from '../components/PunchInButton';
import { AttendanceSummaryCard } from '../components/AttendanceSummaryCard';
import { AttendanceHistoryList } from '../components/AttendanceHistoryList';
import { FaceRegistrationModal } from '../components/FaceRegistrationModal';
import { BiometricEnrollmentModal } from '../components/BiometricEnrollmentModal';
import { UserProfileHeader } from '../components/UserProfileHeader';
import { INITIAL_RECORDS } from '../services/attendanceService';
import { AttendanceRecord } from '../types/attendance';
import { AppUser } from '../types/auth';
import {
  getEmployeeFaceProfile,
  EmployeeFaceProfile,
} from '../services/faceBiometricService';
import {
  checkDeviceBiometricsAvailable,
  openDeviceSecuritySettings,
} from '../services/deviceBiometricService';

interface AttendanceRegisterScreenProps {
  currentUser?: AppUser | null;
  onSignOut?: () => void;
}

export const AttendanceRegisterScreen: React.FC<AttendanceRegisterScreenProps> = ({
  currentUser,
  onSignOut,
}) => {
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);
  const [biometricModalVisible, setBiometricModalVisible] = useState(false);
  const [faceRegisterModalVisible, setFaceRegisterModalVisible] = useState(false);
  const [faceProfile, setFaceProfile] = useState<EmployeeFaceProfile | null>(null);
  const [isFingerprintEnrolled, setIsFingerprintEnrolled] = useState(false);
  const [biometryType, setBiometryType] = useState('Fingerprint');

  const refreshBiometrics = async () => {
    // 1. Fetch Face Profile
    const prof = await getEmployeeFaceProfile('EMP-1024');
    setFaceProfile(prof);

    // 2. Fetch Device Fingerprint status
    const bioStatus = await checkDeviceBiometricsAvailable();
    setIsFingerprintEnrolled(bioStatus.available);
    if (bioStatus.biometryType) {
      setBiometryType(bioStatus.biometryType);
    }
  };

  useEffect(() => {
    refreshBiometrics();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        refreshBiometrics();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handlePunchSuccess = (newRecord: AttendanceRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
  };

  const isFaceEnrolled = Boolean(faceProfile && faceProfile.face_registered);
  const todayRecords = records.filter(
    (r) => r.date === 'Today' && r.status !== 'REJECTED' && r.status !== 'FAILED'
  );
  const todayInRecord = todayRecords.find((r) => r.punchType === 'IN');
  const todayOutRecord = todayRecords.find((r) => r.punchType === 'OUT');
  const isPunchedInToday = Boolean(todayInRecord && !todayOutRecord);
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 20
  );
  const userInitials = currentUser?.displayName
    ? currentUser.displayName.substring(0, 2).toUpperCase()
    : 'PP';

  return (
    <View style={[styles.screenContainer, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Top App Bar with safe area top inset */}
      <View style={[styles.topBar, { paddingTop: topPadding + 6 }]}>
        <View style={styles.topBarLeft}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
          <View style={styles.titleColumn}>
            <Text style={styles.brandTitle} numberOfLines={1}>
              {currentUser?.displayName || 'Attendance Register'}
            </Text>
            <Text style={styles.brandSubtitle} numberOfLines={1}>
              {currentUser?.email || 'Headquarters & Tech Center'}
            </Text>
          </View>
        </View>

        {/* Header Quick Punch In Button */}
        <PunchInButton
          size="small"
          punchType={isPunchedInToday ? 'OUT' : 'IN'}
          onPunchSuccess={handlePunchSuccess}
        />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card with Sign Out if signed in */}
        {currentUser && onSignOut ? (
          <UserProfileHeader user={currentUser} onSignOut={onSignOut} />
        ) : null}

        {/* Attendance Summary Dashboard Card */}
        <AttendanceSummaryCard
          records={records}
          onPunchSuccess={handlePunchSuccess}
        />

        {/* Feature Highlights / Info Pill */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconBox}>
            <AppIcon name="shield" size={16} color={theme.colors.cyan} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>3-Way Verification Active</Text>
            <Text style={styles.infoSub}>
              GPS Geofence (≤500m) + AI Face Liveness + Device Biometrics
            </Text>
          </View>
        </View>

        {/* Unified Biometric Status & Enrollment Card */}
        <View style={styles.biometricEnrollCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.biometricHeaderIcon}>
                <AppIcon name="shield-check" size={18} color={theme.colors.purple} />
              </View>
              <View>
                <Text style={styles.cardHeaderTitle}>Biometric Credentials</Text>
                <Text style={styles.cardHeaderSub}>Face Recognition & Fingerprint</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.manageBtn}
              onPress={() => {
                refreshBiometrics();
                setBiometricModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.manageBtnText}>Manage / Enroll ▾</Text>
            </TouchableOpacity>
          </View>

          {/* Biometrics Status Chips Row */}
          <View style={styles.statusChipsContainer}>
            {/* Face Status Chip */}
            {/* <TouchableOpacity
              style={styles.statusChip}
              onPress={() => {
                setBiometricModalVisible(true);
              }}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.chipIconWrap,
                  { backgroundColor: isFaceEnrolled ? '#10B9811A' : '#F59E0B1A' },
                ]}
              >
                <AppIcon
                  name="camera"
                  size={15}
                  color={isFaceEnrolled ? theme.colors.success : theme.colors.warning}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.chipTitle}>Face ID (AI)</Text>
                <Text
                  style={[
                    styles.chipStatus,
                    { color: isFaceEnrolled ? theme.colors.success : theme.colors.warning },
                  ]}
                >
                  {isFaceEnrolled ? 'Enrolled ✓' : 'Tap to Enroll'}
                </Text>
              </View>
            </TouchableOpacity> */}

            {/* Fingerprint Status Chip */}
            <TouchableOpacity
              style={styles.statusChip}
              onPress={() => {
                setBiometricModalVisible(true);
              }}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.chipIconWrap,
                  { backgroundColor: isFingerprintEnrolled ? '#10B9811A' : '#8B5CF61A' },
                ]}
              >
                <AppIcon
                  name="fingerprint"
                  size={15}
                  color={isFingerprintEnrolled ? theme.colors.success : theme.colors.purple}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.chipTitle}>Phone {biometryType}</Text>
                <Text
                  style={[
                    styles.chipStatus,
                    { color: isFingerprintEnrolled ? theme.colors.success : theme.colors.purple },
                  ]}
                >
                  {isFingerprintEnrolled ? 'Device Ready ✓' : 'Settings Required'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Attendance Records List */}
        <AttendanceHistoryList records={records} />
      </ScrollView>

      {/* Unified Biometric Enrollment Choice Modal */}
      <BiometricEnrollmentModal
        visible={biometricModalVisible}
        faceProfile={faceProfile}
        employeeName={currentUser?.displayName || 'Pratiksha Patel'}
        onClose={() => {
          setBiometricModalVisible(false);
          refreshBiometrics();
        }}
        onOpenFaceEnrollment={() => {
          setFaceRegisterModalVisible(true);
        }}
      />

      {/* Face Registration Camera Modal */}
      <FaceRegistrationModal
        visible={faceRegisterModalVisible}
        employeeId="EMP-1024"
        employeeName={currentUser?.displayName || 'Pratiksha Patel'}
        onClose={() => setFaceRegisterModalVisible(false)}
        onRegisteredSuccess={(newProf) => {
          setFaceProfile(newProf);
          setFaceRegisterModalVisible(false);
          refreshBiometrics();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    borderWidth: 1.5,
    borderColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  titleColumn: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  brandSubtitle: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 12,
    marginTop: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.cyan + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  infoSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  biometricEnrollCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  biometricHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.purpleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  cardHeaderSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  manageBtn: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  manageBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryLight,
  },
  statusChipsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  statusChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  chipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  chipStatus: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1,
  },
});
