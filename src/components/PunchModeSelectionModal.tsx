import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { theme } from '../utils/theme';
import { AppIcon } from './AppIcon';
import {
  PunchVerificationMode,
  PUNCH_MODE_OPTIONS,
  PunchModeOption,
} from '../types/punchMode';

export interface PunchModeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectMode: (mode: PunchVerificationMode) => void;
  initialMode?: PunchVerificationMode;
  punchType?: 'IN' | 'OUT';
}

export const PunchModeSelectionModal: React.FC<PunchModeSelectionModalProps> = ({
  visible,
  onClose,
  onSelectMode,
  initialMode = 'FACE',
  punchType = 'IN',
}) => {
  const [selectedMode, setSelectedMode] =
    useState<PunchVerificationMode>(initialMode);

  const handleConfirm = () => {
    onClose();
    onSelectMode(selectedMode);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropDismiss}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.bottomSheet}>
          {/* Top Grab Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <AppIcon name="shield" size={20} color={theme.colors.cyan} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>
                  Choose Punch {punchType} Mode
                </Text>
                <Text style={styles.headerSubtitle}>
                  Select your attendance verification method
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mandatory GPS Geofence Banner */}
          <View style={styles.mandatoryLocationBanner}>
            <AppIcon name="map-pin" size={16} color={theme.colors.cyan} />
            <Text style={styles.mandatoryLocationText}>
              GPS Proximity (≤ 500m of office) is strictly verified for all modes.
            </Text>
          </View>

          {/* Verification Mode Options List */}
          <View style={styles.optionsList}>
            {PUNCH_MODE_OPTIONS.map((opt: PunchModeOption) => {
              const isSelected = selectedMode === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.85}
                  onPress={() => setSelectedMode(opt.id)}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                >
                  {/* Left Icon Box */}
                  <View
                    style={[
                      styles.optIconBox,
                      isSelected && styles.optIconBoxSelected,
                    ]}
                  >
                    <AppIcon name={opt.iconName} size={20} />
                  </View>

                  {/* Content */}
                  <View style={styles.optContent}>
                    <View style={styles.optTitleRow}>
                      <Text
                        style={[
                          styles.optTitle,
                          isSelected && styles.optTitleSelected,
                        ]}
                      >
                        {opt.title}
                      </Text>
                      {opt.badgeText && (
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor:
                                opt.id === 'LOCATION_ONLY'
                                  ? '#0284C720'
                                  : opt.id === 'FACE'
                                  ? '#10B98120'
                                  : '#8B5CF620',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              { color: opt.badgeColor },
                            ]}
                          >
                            {opt.badgeText}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.optSubtitle}>{opt.subtitle}</Text>
                  </View>

                  {/* Right Selected Radio / Check Indicator */}
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.proceedBtn,
                punchType === 'OUT' && {
                  backgroundColor: '#E11D48',
                  shadowColor: '#E11D48',
                },
              ]}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.proceedBtnText}>
                Proceed to Punch {punchType}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  backdropDismiss: {
    flex: 1,
  },
  bottomSheet: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#06B6D41A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#06B6D433',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  mandatoryLocationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#06B6D415',
    borderWidth: 1,
    borderColor: '#06B6D440',
    gap: 10,
    marginBottom: 16,
  },
  mandatoryLocationText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#38BDF8',
    fontWeight: '500',
  },
  optionsList: {
    gap: 10,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceLight + '60',
  },
  optionCardSelected: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: '#1E40AF20',
  },
  optIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    marginRight: 12,
  },
  optIconBoxSelected: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: theme.colors.primaryLight + '25',
  },
  optContent: {
    flex: 1,
  },
  optTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  optTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  optTitleSelected: {
    color: '#93C5FD',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  optSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textMuted,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioCircleSelected: {
    borderColor: theme.colors.primaryLight,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primaryLight,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  cancelBtnText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  proceedBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
