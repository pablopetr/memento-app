import Config from 'react-native-config';

/**
 * Typed, centralized access to build-time environment variables.
 *
 * Keeping this in one place means the rest of the app never touches
 * `react-native-config` directly, so the source of configuration can be
 * swapped or mocked in tests without changing call sites.
 */
export const env = {
  apiUrl: Config.API_URL ?? '',
} as const;

export type Env = typeof env;
