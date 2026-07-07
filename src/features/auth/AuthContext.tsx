import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as authService from '../../services/auth/authService';
import {LoginCredentials} from '../../services/auth/authService';
import {User} from '../../types/user';

/**
 * Lightweight client-state context for the current session. It exposes the
 * signed-in status the RootNavigator uses to switch between the auth and main
 * stacks, and thin wrappers over the auth service.
 *
 * Server state (reminders, etc.) lives in TanStack Query, not here — this
 * holds only session/client state (KISS).
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // On boot, decide whether a valid session already exists.
  useEffect(() => {
    let active = true;
    authService
      .isAuthenticated()
      .then(authed => {
        if (active && authed) {
          // A token exists; the profile is hydrated lazily by feature hooks.
          setUser(prev => prev ?? {id: 'me', email: ''});
        }
      })
      .finally(() => {
        if (active) {
          setIsBootstrapping(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const signedIn = await authService.login(credentials);
    setUser(signedIn);
  }, []);

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isBootstrapping,
      signIn,
      signOut,
    }),
    [user, isBootstrapping, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
