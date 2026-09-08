import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../utils/theme';
import { AppIcon } from '../components/AppIcon';
import { PunchInButton } from '../components/PunchInButton';
import { AttendanceSummaryCard } from '../components/AttendanceSummaryCard';
import { AttendanceHistoryList } from '../components/AttendanceHistoryList';
import { FaceRegistrationModal } from '../components/FaceRegistrationModal';
import { INITIAL_RECORDS } from '../services/attendanceService';
import { AttendanceRecord } from '../types/attendance';
import {
  getEmployeeFaceProfile,
  EmployeeFaceProfile,
} from '../services/faceBiometricService';

export const AttendanceRegisterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);
  const [faceRegisterModalVisible, setFaceRegisterModalVisible] = useState(false);
  const [faceProfile, setFaceProfile] = useState<EmployeeFaceProfile | null>(null);

  useEffect(() => {
    getEmployeeFaceProfile('EMP-1024').then((prof) => {
      setFaceProfile(prof);
    });
  }, []);

  const handlePunchSuccess = (newRecord: AttendanceRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
  };

  const isEnrolled = Boolean(faceProfile && faceProfile.face_registered);
  const todayRecords = records.filter(
    (r) => r.date === 'Today' && r.status !== 'REJECTED' && r.status !== 'FAILED'
  );
  const todayInRecord = todayRecords.find((r) => r.punchType === 'IN');
  const todayOutRecord = todayRecords.find((r) => r.punchType === 'OUT');
  const isPunchedInToday = Boolean(todayInRecord && !todayOutRecord);
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 20);

  return (
    <View style={[styles.screenContainer, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" />

      {/* Top App Bar with safe area top inset */}
      <View style={[styles.topBar, { paddingTop: topPadding + 6 }]}>
        <View style={styles.topBarLeft}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>PP</Text>
          </View>
          <View style={styles.titleColumn}>
            <Text style={styles.brandTitle} numberOfLines={1}>
              Attendance Register
            </Text>
            <Text style={styles.brandSubtitle} numberOfLines={1}>
              Headquarters & Tech Center
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

        {/* Face Profile Registration Banner */}
        <View style={styles.faceEnrollCard}>
          <View style={styles.faceEnrollLeft}>
            <View
              style={[
                styles.faceIconCircle,
                {
                  backgroundColor: isEnrolled ? '#10B9811A' : '#F59E0B1A',
                },
              ]}
            >
              <AppIcon
                name="camera"
                size={18}
                color={isEnrolled ? theme.colors.success : theme.colors.warning}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.faceTitleRow}>
                <Text style={styles.faceEnrollTitle}>Face Biometrics</Text>
                <View
                  style={[
                    styles.enrolledBadge,
                    {
                      backgroundColor: isEnrolled ? '#10B98120' : '#F59E0B20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.enrolledBadgeText,
                      { color: isEnrolled ? '#10B981' : '#F59E0B' },
                    ]}
                  >
                    {isEnrolled ? 'Enrolled ✓' : 'Not Enrolled'}
                  </Text>
                </View>
              </View>
              <Text style={styles.faceEnrollSub}>
                {isEnrolled
                  ? '128D AI Biometric Template active for EMP-1024'
                  : 'No facial biometric enrolled yet. Tap to enroll.'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.reEnrollBtn,
              !isEnrolled && { backgroundColor: theme.colors.primaryLight },
            ]}
            onPress={() => setFaceRegisterModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.reEnrollText,
                !isEnrolled && { color: '#FFFFFF', fontWeight: '700' },
              ]}
            >
              {isEnrolled ? 'Manage / Re-Enroll' : 'Enroll Face Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Attendance Records List */}
        <AttendanceHistoryList records={records} />
      </ScrollView>

      {/* Face Registration Modal */}
      <FaceRegistrationModal
        visible={faceRegisterModalVisible}
        employeeId="EMP-1024"
        employeeName="Pratiksha Patel"
        onClose={() => setFaceRegisterModalVisible(false)}
        onRegisteredSuccess={(newProf) => {
          setFaceProfile(newProf);
          setFaceRegisterModalVisible(false);
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
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  titleColumn: {
    flex: 1,
  },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  brandSubtitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#06B6D41A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: theme.colors.text,
  },
  infoSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  faceEnrollCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  faceEnrollLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  faceIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#3B82F61A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  faceEnrollTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  enrolledBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  enrolledBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  faceEnrollSub: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  reEnrollBtn: {
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  reEnrollText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
