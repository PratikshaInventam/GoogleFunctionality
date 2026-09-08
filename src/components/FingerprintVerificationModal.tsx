import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { theme } from '../utils/theme';
import { AppIcon } from './AppIcon';
import { ValidatedLocationInfo } from '../types/location';
import { formatDistance } from '../utils/distanceUtils';

export interface FingerprintVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onVerificationSuccess: () => void;
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
  const [state, setState] = useState<'TOUCH' | 'SCANNING' | 'SUCCESS'>('TOUCH');

  const radarAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      setState('TOUCH');
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

    // Automated biometric sensor simulation
    const t1 = setTimeout(() => {
      setState('SCANNING');
    }, 1200);

    const t2 = setTimeout(() => {
      setState('SUCCESS');
    }, 2800);

    const t3 = setTimeout(() => {
      onVerificationSuccess();
    }, 3800);

    return () => {
      radarLoop.stop();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Top Grab / Close */}
          <View style={styles.topHeader}>
            <View style={styles.badgeRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>DEVICE BIOMETRIC</Text>
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

          {/* Sensor Scan Icon with Pulsing Radar Ring */}
          <View style={styles.sensorContainer}>
            <Animated.View
              style={[
                styles.radarRing,
                {
                  transform: [{ scale: radarAnim }],
                  opacity: opacityAnim,
                },
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setState('SUCCESS');
                setTimeout(() => onVerificationSuccess(), 600);
              }}
              style={[
                styles.sensorCircle,
                state === 'SUCCESS' && styles.sensorCircleSuccess,
              ]}
            >
              <AppIcon
                name={state === 'SUCCESS' ? 'check' : 'fingerprint'}
                size={54}
                color={state === 'SUCCESS' ? theme.colors.success : theme.colors.purple}
              />
            </TouchableOpacity>
          </View>

          {/* Status Instructions */}
          <Text style={styles.instructionText}>
            {state === 'TOUCH'
              ? 'Touch the fingerprint sensor'
              : state === 'SCANNING'
              ? 'Authenticating fingerprint…'
              : 'Biometric Authenticated!'}
          </Text>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.instantVerifyBtn}
              onPress={onVerificationSuccess}
              activeOpacity={0.8}
            >
              <Text style={styles.instantVerifyText}>Instant Verify</Text>
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
    marginVertical: 28,
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
  instructionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
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
  instantVerifyBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: theme.colors.purple,
    alignItems: 'center',
  },
  instantVerifyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
