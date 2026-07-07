import {apiClient} from '../api/client';
import {endpoints} from '../api/endpoints';
import {User} from '../../types/user';
import {clearTokens, getAccessToken, saveTokens} from './tokenStore';

/**
 * Owns the authentication lifecycle: exchanging credentials for tokens,
 * persisting them, and clearing them on logout. UI talks to this via the
 * auth hook/context — never to the HTTP client or Keychain directly.
 *
 * The login response shape is fleshed out in docs/02-login-screen.md /
 * docs/05-backend-integration.md.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const {data} = await apiClient.post<LoginResponse>(
    endpoints.auth.login,
    credentials,
  );
  await saveTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  return data.user;
}

export async function logout(): Promise<void> {
  await clearTokens();
}

/** True when a token is present — used on boot to pick the initial stack. */
export async function isAuthenticated(): Promise<boolean> {
  return (await getAccessToken()) !== null;
}
