import axios, {AxiosInstance} from 'axios';

import {env} from '../../config/env';
import {getAccessToken} from '../auth/tokenStore';
import {refreshAccessToken} from '../auth/authService';
import {toApiError} from './errors';

/**
 * Single shared axios instance. Interceptors attach the JWT to every request,
 * refresh expired tokens, and normalize errors so the app has a single error
 * shape. Screens never import this directly — services do.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: {'Content-Type': 'application/json'},
});

/** Callback invoked when the session expires (401 + refresh fails). Set by AuthContext. */
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredCallback(callback: (() => void) | null) {
  onSessionExpired = callback;
}

// Request: attach JWT.
apiClient.interceptors.request.use(async config => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: refresh on 401 once, else normalize error.
// Deduplicate concurrent token refresh requests by sharing the promise.
let refreshing: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    // 401 Unauthorized: try to refresh once.
    if (
      error.response?.status === 401 &&
      !original._retry &&
      original.method !== 'post' // don't retry login/refresh attempts
    ) {
      original._retry = true;
      try {
        // Deduplicate: all concurrent 401s share the same refresh promise.
        if (!refreshing) {
          refreshing = refreshAccessToken();
        }
        const newToken = await refreshing;
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(original);
        }
        // Refresh failed: session expired.
        if (onSessionExpired) {
          onSessionExpired();
        }
      } finally {
        // Only clear after this request's retry is complete.
        refreshing = null;
      }
    }
    return Promise.reject(toApiError(error));
  },
);
