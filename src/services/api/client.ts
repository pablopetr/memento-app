import axios, {AxiosInstance} from 'axios';

import {env} from '../../config/env';
import {getAccessToken} from '../auth/tokenStore';

/**
 * Single shared axios instance. Interceptors attach the JWT to every request
 * and give us one place to centralize error handling later
 * (see docs/05-backend-integration.md and docs/10-error-handling.md).
 *
 * Screens never import this directly — services do.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: {'Content-Type': 'application/json'},
});

apiClient.interceptors.request.use(async config => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
