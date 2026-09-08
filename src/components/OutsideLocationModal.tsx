import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../utils/theme';
import { AppIcon } from './AppIcon';
import { PunchResultInfo } from '../types/attendance';
import { formatDistance } from '../utils/distanceUtils';

export interface OutsideLocationModalProps {
  visible: boolean;
  result: PunchResultInfo | null;
  onClose: () => void;
}

export const OutsideLocationModal: React.FC<OutsideLocationModalProps> = ({
  visible,
  result,
  onClose,
}) => {
  if (!result) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.alertIconCircle}>
            <AppIcon name="alert-circle" size={28} />
          </View>

          <Text style={styles.title}>Outside Allowed Location</Text>

          <Text style={styles.message}>
            {result.message ||
              'You must be within 500 meters of the designated office premises to register attendance.'}
          </Text>

          <View style={styles.distanceBox}>
            <View style={styles.distanceRow}>
              <Text style={styles.distLabel}>Your Distance:</Text>
              <Text style={styles.distValDanger}>
                {formatDistance(result.distanceMeters ?? 0)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.distanceRow}>
              <Text style={styles.distLabel}>Allowed Radius:</Text>
              <Text style={styles.distValSuccess}>
                {formatDistance(result.allowedRadiusMeters ?? 500)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeBtnText}>Understand & Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 22,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  alertIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EF444420',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  distanceBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  distanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  distLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  distValDanger: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  distValSuccess: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  closeBtn: {
    width: '100%',
    paddingVertical: 13,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  closeBtnText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
