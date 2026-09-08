import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { theme } from '../utils/theme';
import { AppIcon } from './AppIcon';
import { AttendanceRecord } from '../types/attendance';
import { formatDistance } from '../utils/distanceUtils';

export interface AttendanceHistoryListProps {
  records: AttendanceRecord[];
}

export const AttendanceHistoryList: React.FC<AttendanceHistoryListProps> = ({
  records,
}) => {
  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'FACE':
        return { label: 'Face AI', color: theme.colors.success, bg: '#10B98120' };
      case 'FINGERPRINT':
        return { label: 'Fingerprint', color: theme.colors.purple, bg: '#8B5CF620' };
      default:
        return { label: 'GPS Only', color: '#0284C7', bg: '#0284C720' };
    }
  };

  const renderItem = ({ item }: { item: AttendanceRecord }) => {
    const modeInfo = getModeBadge(item.verificationMode);
    const isPunchIn = item.punchType === 'IN';
    const isFailed = item.status === 'REJECTED' || item.status === 'FAILED';

    return (
      <View style={[styles.card, isFailed && styles.cardFailed]}>
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.punchIconWrap,
              {
                backgroundColor: isFailed
                  ? '#EF444420'
                  : isPunchIn
                  ? '#10B98120'
                  : '#E11D4820',
              },
            ]}
          >
            <AppIcon
              name={
                isFailed
                  ? 'close'
                  : isPunchIn
                  ? 'arrow-down-left'
                  : 'arrow-up-right'
              }
              size={18}
              color={isFailed ? '#EF4444' : undefined}
            />
          </View>
          <View style={styles.infoCol}>
            <View style={styles.titleRow}>
              <Text style={[styles.punchTypeText, isFailed && { color: '#EF4444' }]}>
                {isFailed ? 'Punch Blocked ❌' : `Punch ${item.punchType}`}
              </Text>
              <View style={[styles.modeBadge, { backgroundColor: modeInfo.bg }]}>
                <Text style={[styles.modeText, { color: modeInfo.color }]}>
                  {modeInfo.label}
                </Text>
              </View>
            </View>
            <Text style={styles.dateSub}>
              {item.date} • {item.punchInTime || item.punchOutTime || 'Just now'}
            </Text>
            {item.failureReason ? (
              <Text style={styles.failureReasonSub} numberOfLines={2}>
                ⚠️ {item.failureReason}
              </Text>
            ) : (
              <Text style={styles.locationSub} numberOfLines={1}>
                {item.locationName} ({formatDistance(item.distanceFromOffice)})
              </Text>
            )}
          </View>
        </View>

        <View style={styles.cardRight}>
          <View
            style={[
              styles.statusBadge,
              isFailed && { backgroundColor: '#EF444420' },
              item.status === 'LATE' && { backgroundColor: '#F59E0B20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isFailed && { color: '#EF4444' },
                item.status === 'LATE' && { color: '#F59E0B' },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Attendance Logs</Text>
        <Text style={styles.recordCount}>{records.length} records</Text>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  recordCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  listContent: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardFailed: {
    borderColor: '#EF444440',
    backgroundColor: '#1E1B24',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  punchIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  punchTypeText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dateSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  locationSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  failureReasonSub: {
    fontSize: 11,
    color: '#F87171',
    marginTop: 2,
    fontWeight: '600',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
});
