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
import { openAppSettings } from '../services/permissionService';

export interface PermissionModalProps {
  visible: boolean;
  permissionType: 'camera' | 'location';
  onClose: () => void;
  onRequestAgain: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  permissionType,
  onClose,
  onRequestAgain,
}) => {
  const isCamera = permissionType === 'camera';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <AppIcon
              name={isCamera ? 'camera' : 'map-pin'}
              size={28}
              color={theme.colors.accent}
            />
          </View>

          <Text style={styles.title}>
            {isCamera ? 'Camera Permission Required' : 'Location Permission Required'}
          </Text>

          <Text style={styles.description}>
            {isCamera
              ? 'Front camera access is required to capture your face and perform live anti-spoofing verification for attendance.'
              : 'GPS location access is required to verify that you are within the 500m geofence of your workplace.'}
          </Text>

          <View style={styles.btnColumn}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                onClose();
                onRequestAgain();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Allow Permission</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => {
                onClose();
                openAppSettings();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.settingsBtnText}>Open Device Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#06B6D41A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#06B6D433',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  btnColumn: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  settingsBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  settingsBtnText: {
    color: theme.colors.text,
    fontSize: 13.5,
    fontWeight: '600',
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
});
