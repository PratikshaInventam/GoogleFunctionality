export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  providerId: string;
  isAnonymous?: boolean;
}

export interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  error: string | null;
}
