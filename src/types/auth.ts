/**
 * Types pour l'authentification Firebase
 */

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
}

export interface EmailLinkState {
  emailLinkSent: boolean;
  emailLinkLoading: boolean;
}

export interface AuthContextType extends AuthState, EmailLinkState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendEmailLink: (email: string) => Promise<void>;
  completeEmailLinkSignIn: (email: string, link: string) => Promise<void>;
  isEmailLinkSignIn: (link: string) => boolean;
}
