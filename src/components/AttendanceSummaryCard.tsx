import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../utils/theme';
import { AppIcon } from './AppIcon';
import { PunchInButton } from './PunchInButton';
import { AttendanceRecord } from '../types/attendance';

export interface AttendanceSummaryCardProps {
  records?: AttendanceRecord[];
  latestRecord?: AttendanceRecord;
  onPunchSuccess?: (record: AttendanceRecord) => void;
}

export const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({
  records = [],
  latestRecord,
  onPunchSuccess,
}) => {
  // Combine records if provided, fallback to latestRecord
  const allRecords = records.length > 0 ? records : latestRecord ? [latestRecord] : [];

  const todayRecords = allRecords.filter(
    (r) => r.date === 'Today' && r.status !== 'REJECTED' && r.status !== 'FAILED'
  );

  const todayInRecord = todayRecords.find((r) => r.punchType === 'IN');
  const todayOutRecord = todayRecords.find((r) => r.punchType === 'OUT');

  const isPunchedIn = Boolean(todayInRecord && !todayOutRecord);
  const isShiftCompleted = Boolean(todayInRecord && todayOutRecord);

  const punchInTime = todayInRecord?.punchInTime || '—';
  const punchOutTime = todayOutRecord?.punchOutTime || '—';

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isPunchedIn) {
      if (!isShiftCompleted) {
        setElapsedSeconds(0);
      }
      return;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPunchedIn, isShiftCompleted]);

  const formatElapsed = (totalSecs: number) => {
    const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSecs % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const getStatusBadge = () => {
    if (isShiftCompleted) {
      return {
        label: 'Shift Completed ✓',
        color: '#10B981',
        bg: '#10B98120',
        dotColor: '#10B981',
      };
    }
    if (isPunchedIn) {
      return {
        label: 'Punched In',
        color: theme.colors.success,
        bg: theme.colors.successBg,
        dotColor: theme.colors.success,
      };
    }
    return {
      label: 'Not Punched In',
      color: theme.colors.textSecondary,
      bg: theme.colors.surfaceLight,
      dotColor: theme.colors.textMuted,
    };
  };

  const badgeInfo = getStatusBadge();

  return (
    <View style={styles.container}>
      {/* Background glow header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.dateLabel}>Tuesday, 08 Sep 2026</Text>
          <Text style={styles.employeeName}>Pratiksha Patel</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: badgeInfo.bg,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: badgeInfo.dotColor,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: badgeInfo.color,
              },
            ]}
          >
            {badgeInfo.label}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Punch In</Text>
          <Text style={styles.statValue}>{punchInTime}</Text>
          <Text style={styles.statSub}>
            {todayInRecord ? 'GPS & Face Verified' : 'Shift starts 09:00 AM'}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Punch Out</Text>
          <Text style={styles.statValue}>{punchOutTime}</Text>
          <Text style={styles.statSub}>
            {todayOutRecord ? 'GPS & Face Verified' : 'Shift ends 06:30 PM'}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Working Time</Text>
          <Text
            style={[
              styles.statValue,
              {
                color: isPunchedIn
                  ? theme.colors.accent
                  : isShiftCompleted
                  ? theme.colors.success
                  : theme.colors.textMuted,
              },
            ]}
          >
            {isPunchedIn
              ? formatElapsed(elapsedSeconds)
              : isShiftCompleted
              ? 'Shift Finished'
              : '00:00:00'}
          </Text>
          <Text style={styles.statSub}>
            {isPunchedIn
              ? 'Active Session'
              : isShiftCompleted
              ? 'Completed'
              : 'Session Inactive'}
          </Text>
        </View>
      </View>

      {/* Geofence Proximity Badge */}
      <View style={styles.geofenceRow}>
        <AppIcon name="map-pin" size={14} color={theme.colors.accent} />
        <Text style={styles.geofenceText} numberOfLines={1}>
          Headquarters & Tech Center • Within 500m geofence
        </Text>
      </View>

      {/* Primary Action Button */}
      <View style={styles.actionRow}>
        <PunchInButton
          punchType={isPunchedIn ? 'OUT' : 'IN'}
          size="large"
          onPunchSuccess={onPunchSuccess}
          style={styles.fullButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    height: '80%',
    alignSelf: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statSub: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  geofenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06B6D415',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#06B6D42A',
  },
  geofenceText: {
    fontSize: 11.5,
    color: '#38BDF8',
    fontWeight: '600',
    flex: 1,
  },
  actionRow: {
    width: '100%',
  },
  fullButton: {
    width: '100%',
  },
});
