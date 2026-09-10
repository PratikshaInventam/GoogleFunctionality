import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { theme } from '../utils/theme';
import { AppIcon } from '../components/AppIcon';
import { signInWithGoogle } from '../services/authService';
import { AppUser } from '../types/auth';

interface LoginScreenProps {
  onLoginSuccess?: (user: AppUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const user = await signInWithGoogle();
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (error: any) {
      console.error('[LoginScreen] Sign-In Error:', error);
      setErrorMessage(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Brand Logo */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🛡️</Text>
          </View>
          <Text style={styles.appTitle}>AttendancePortal</Text>
          <Text style={styles.appSubtitle}>
            Smart Biometric & Location-Based Attendance
          </Text>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.featurePills}>
            <View style={styles.pill}>
              <Text style={styles.pillIcon}>👤</Text>
              <Text style={styles.pillText}>Face ID</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillIcon}>👆</Text>
              <Text style={styles.pillText}>Fingerprint</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillIcon}>📍</Text>
              <Text style={styles.pillText}>Geo-Fencing</Text>
            </View>
          </View>

          <Text style={styles.cardHeading}>Sign in to Continue</Text>
          <Text style={styles.cardDescription}>
            Authenticate securely using your Google account to record attendance and access logs.
          </Text>

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <AppIcon name="alert-circle" size={18} color={theme.colors.danger} />
              <View style={styles.errorTextContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
                {errorMessage.toLowerCase().includes('configuration') ||
                errorMessage.toLowerCase().includes('play') ||
                errorMessage.toLowerCase().includes('developer') ? (
                  <TouchableOpacity
                    onPress={() => setShowConfigHelp(!showConfigHelp)}
                    style={styles.helpLink}
                  >
                    <Text style={styles.helpLinkText}>
                      {showConfigHelp ? 'Hide Setup Help' : 'View Firebase Setup Help ▾'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Setup Help Dropdown */}
          {showConfigHelp ? (
            <View style={styles.helpBox}>
              <Text style={styles.helpTitle}>Firebase Setup Checklist:</Text>
              <Text style={styles.helpStep}>
                1. Enable Google Provider in Firebase Console Auth.
              </Text>
              <Text style={styles.helpStep}>
                2. Put `google-services.json` inside `android/app/`.
              </Text>
              <Text style={styles.helpStep}>
                3. Register your debug SHA-1 fingerprint in Firebase Project Settings.
              </Text>
            </View>
          ) : null}

          {/* Google Sign In Button */}
          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#1F2937" size="small" />
                <Text style={styles.googleButtonTextLoading}>Signing in with Google...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <View style={styles.gLogoContainer}>
                  <Text style={styles.gLogoText}>G</Text>
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Security Notice */}
          <View style={styles.securityRow}>
            <AppIcon name="shield" size={14} color={theme.colors.textMuted} />
            <Text style={styles.securityText}>
              Powered by Firebase Authentication (OAuth 2.0)
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Google Authentication • Free & Secure Tier
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: theme.colors.primaryLight + '50',
    shadowColor: theme.colors.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoIcon: {
    fontSize: 30,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  featurePills: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    gap: 4,
  },
  pillIcon: {
    fontSize: 12,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: theme.spacing.xl,
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.dangerBg,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.danger + '40',
    alignItems: 'flex-start',
    gap: 10,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.danger,
    lineHeight: 16,
  },
  helpLink: {
    marginTop: 6,
  },
  helpLinkText: {
    fontSize: 11,
    color: theme.colors.primaryLight,
    fontWeight: '600',
  },
  helpBox: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  helpTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  helpStep: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  gLogoContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gLogoText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleButtonTextLoading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: theme.spacing.lg,
  },
  securityText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
});
