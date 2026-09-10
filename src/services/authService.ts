import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AppUser } from '../types/auth';

const DEFAULT_WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

let isConfigured = false;

export const configureGoogleSignIn = (webClientId: string = DEFAULT_WEB_CLIENT_ID) => {
  try {
    GoogleSignin.configure({
      webClientId: webClientId !== DEFAULT_WEB_CLIENT_ID ? webClientId : undefined,
      offlineAccess: true,
      scopes: ['profile', 'email'],
    });
    isConfigured = true;
  } catch (error) {
    console.warn('[authService] GoogleSignin.configure error:', error);
  }
};

// Initialize default configuration
configureGoogleSignIn();

export const mapFirebaseUser = (user: User | null): AppUser | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
    providerId: user.providerId,
    isAnonymous: user.isAnonymous,
  };
};

export const signInWithGoogle = async (): Promise<AppUser> => {
  try {
    if (!isConfigured) {
      configureGoogleSignIn();
    }

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const signInResult = await GoogleSignin.signIn();

    const idToken =
      (signInResult as any)?.data?.idToken ||
      (signInResult as any)?.idToken;

    if (!idToken) {
      throw new Error('Google Sign-In was cancelled or failed to retrieve ID token.');
    }

    const googleCredential = GoogleAuthProvider.credential(idToken);
    const auth = getAuth();
    const userCredential = await signInWithCredential(auth, googleCredential);

    const appUser = mapFirebaseUser(userCredential.user);
    if (!appUser) {
      throw new Error('Failed to retrieve user profile after Firebase sign-in.');
    }

    return appUser;
  } catch (error: any) {
    console.error('[authService] signInWithGoogle error:', error);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('Sign-in cancelled by user');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error('Sign-in is already in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services is not available or outdated');
    } else {
      throw new Error(error.message || 'Google Sign-In failed. Please check configuration.');
    }
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut().catch(() => {});
    const auth = getAuth();
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('[authService] signOut error:', error);
    throw error;
  }
};

export const getCurrentUser = (): AppUser | null => {
  try {
    const auth = getAuth();
    return mapFirebaseUser(auth.currentUser);
  } catch {
    return null;
  }
};

export const subscribeToAuthState = (
  callback: (user: AppUser | null) => void
): (() => void) => {
  try {
    const auth = getAuth();
    return onAuthStateChanged(auth, (user: User | null) => {
      callback(mapFirebaseUser(user));
    });
  } catch (e) {
    console.warn('[authService] subscribeToAuthState error:', e);
    return () => {};
  }
};
