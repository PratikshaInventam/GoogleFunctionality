import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { theme } from '../utils/theme';
import { AppIcon } from './AppIcon';
import { usePunchLocation } from '../hooks/usePunchLocation';
import { PunchVerificationMode, PunchType } from '../types/punchMode';
import { PunchModeSelectionModal } from './PunchModeSelectionModal';
import { FaceVerificationModal } from './FaceVerificationModal';
import { FingerprintVerificationModal } from './FingerprintVerificationModal';
import { OutsideLocationModal } from './OutsideLocationModal';

export interface PunchInButtonProps {
  onPunchSuccess?: (record: any) => void;
  size?: 'small' | 'medium' | 'large';
  punchType?: PunchType;
  style?: ViewStyle;
}

export const PunchInButton: React.FC<PunchInButtonProps> = ({
  onPunchSuccess,
  size = 'medium',
  punchType = 'IN',
  style,
}) => {
  const [modeModalVisible, setModeModalVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState<PunchVerificationMode>('FACE');

  const {
    status,
    isPunching,
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
  } = usePunchLocation({
    onSuccess: onPunchSuccess,
  });

  const getButtonLabel = () => {
    switch (status) {
      case 'checking_permission':
        return 'Checking GPS…';
      case 'getting_location':
        return 'Getting Location…';
      case 'validating_location':
        return 'Validating…';
      case 'face_verification':
        return 'Verifying Face…';
      case 'fingerprint_verification':
        return 'Fingerprint…';
      case 'punching':
        return 'Recording…';
      case 'success':
        return 'Success! ✓';
      default:
        return punchType === 'IN' ? 'Punch In' : 'Punch Out';
    }
  };

  const handlePress = () => {
    setModeModalVisible(true);
  };

  const handleSelectModeAndPunch = (mode: PunchVerificationMode) => {
    setSelectedMode(mode);
    setModeModalVisible(false);
    executePunch(mode, punchType);
  };

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const isPunchIn = punchType === 'IN';
  const btnColor = isPunchIn ? theme.colors.primaryLight : '#E11D48';

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        disabled={isPunching}
        activeOpacity={0.82}
        style={[
          styles.button,
          {
            backgroundColor: status === 'success' ? theme.colors.success : btnColor,
            borderColor: status === 'success' ? theme.colors.success : btnColor,
            paddingVertical: isSmall ? 7 : isLarge ? 14 : 10,
            paddingHorizontal: isSmall ? 12 : isLarge ? 22 : 16,
            opacity: isPunching ? 0.85 : 1,
          },
          isLarge && styles.buttonLargeShadow,
          style,
        ]}
      >
        {isPunching ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
            style={{ marginRight: 6 }}
          />
        ) : (
          <View style={styles.iconWrap}>
            <AppIcon
              name={
                status === 'success'
                  ? 'check'
                  : isPunchIn
                  ? 'arrow-down-left'
                  : 'arrow-up-right'
              }
              size={isSmall ? 14 : isLarge ? 18 : 15}
            />
          </View>
        )}
        <Text
          style={[
            styles.btnText,
            {
              fontSize: isSmall ? 12 : isLarge ? 16 : 13.5,
              fontWeight: '700',
            },
          ]}
          numberOfLines={1}
        >
          {getButtonLabel()}
        </Text>
      </TouchableOpacity>

      {/* Verification Mode Selection Modal */}
      <PunchModeSelectionModal
        visible={modeModalVisible}
        onClose={() => setModeModalVisible(false)}
        onSelectMode={handleSelectModeAndPunch}
        initialMode={selectedMode}
        punchType={punchType}
      />

      {/* Outside Allowed Location Modal */}
      <OutsideLocationModal
        visible={isOutsideModalVisible}
        result={lastResult}
        onClose={closeOutsideModal}
      />

      {/* Face Verification Modal */}
      <FaceVerificationModal
        visible={isFaceModalVisible}
        onClose={closeFaceModal}
        onVerificationSuccess={handleFaceSuccess}
        onVerificationFailed={handleFaceFailed}
        employeeId={employeeId}
        employeeName={employeeName}
        validatedLocation={validatedLocationInfo || undefined}
      />

      {/* Fingerprint Verification Modal */}
      <FingerprintVerificationModal
        visible={isFingerprintModalVisible}
        onClose={closeFingerprintModal}
        onVerificationSuccess={handleFingerprintSuccess}
        onVerificationFailed={handleFingerprintFailed}
        employeeName={employeeName}
        validatedLocation={validatedLocationInfo || undefined}
      />
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonLargeShadow: {
    elevation: 6,
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  iconWrap: {
    marginRight: 6,
  },
  btnText: {
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
