import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { AppUser } from '../types/auth';
import { theme } from '../utils/theme';
import { AppIcon } from './AppIcon';

interface UserProfileHeaderProps {
  user: AppUser;
  onSignOut: () => void;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  onSignOut,
}) => {
  const handleSignOutPress = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out from your Google account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: onSignOut,
        },
      ]
    );
  };

  const initial = (user.displayName || user.email || 'U')[0].toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.profileRow}>
        <View style={styles.avatarWrapper}>
          {user.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
          <View style={styles.providerBadge}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName} numberOfLines={1}>
              {user.displayName || 'Google User'}
            </Text>
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
          {user.email ? (
            <Text style={styles.email} numberOfLines={1}>
              {user.email}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOutPress}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppIcon name="log-out" size={16} color={theme.colors.danger} />
          <Text style={styles.signOutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  providerBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  googleIconText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#4285F4',
  },
  userInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    flexShrink: 1,
  },
  verifiedTag: {
    backgroundColor: theme.colors.successBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.success + '40',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.success,
  },
  email: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.dangerBg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.danger + '40',
  },
  signOutText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.danger,
  },
});
