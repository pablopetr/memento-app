import * as Keychain from 'react-native-keychain';

/**
 * Persists the JWT (and refresh token) in the platform secure enclave
 * (iOS Keychain / Android Keystore) rather than plain AsyncStorage.
 *
 * This is the single source of truth for token persistence; the API client
 * and auth service depend on this interface, never on Keychain directly.
 */
const SERVICE = 'com.memento.auth';

export interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
}

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await Keychain.setGenericPassword('memento', JSON.stringify(tokens), {
    service: SERVICE,
  });
}

export async function getTokens(): Promise<StoredTokens | null> {
  const creds = await Keychain.getGenericPassword({service: SERVICE});
  if (!creds) {
    return null;
  }
  try {
    return JSON.parse(creds.password) as StoredTokens;
  } catch {
    return null;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const tokens = await getTokens();
  return tokens?.accessToken ?? null;
}

export async function clearTokens(): Promise<void> {
  await Keychain.resetGenericPassword({service: SERVICE});
}
