import {AxiosError} from 'axios';

import {ApiError} from '../../types/api';

/**
 * Map any error (axios, network, timeout, etc.) to a normalized ApiError with
 * a user-safe message. This is the single place the API layer surfaces errors
 * to the UI so components never inspect raw axios internals.
 */
export function toApiError(error: unknown): ApiError {
  // Timeout
  if (error instanceof AxiosError && error.code === 'ECONNABORTED') {
    return Object.assign(new Error('The request timed out. Try again.'), {
      kind: 'timeout' as const,
      message: 'The request timed out. Try again.',
    }) as ApiError;
  }

  // Network (no response from server)
  if (error instanceof AxiosError && !error.response) {
    return Object.assign(new Error('No connection. Check your network.'), {
      kind: 'network' as const,
      message: 'No connection. Check your network.',
    }) as ApiError;
  }

  // HTTP response received
  if (error instanceof AxiosError && error.response) {
    const {status, data} = error.response;
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? (data as {message?: string}).message
        : undefined;

    if (status === 401) {
      return Object.assign(new Error('Session expired. Please log in again.'), {
        kind: 'unauthorized' as const,
        message: 'Session expired. Please log in again.',
        status,
      }) as ApiError;
    }

    if (status === 422 || status === 400) {
      const fieldErrors =
        typeof data === 'object' && data !== null && 'errors' in data
          ? (data as {errors?: Record<string, string>}).errors
          : undefined;
      return Object.assign(new Error(message ?? 'Invalid input.'), {
        kind: 'validation' as const,
        message: message ?? 'Invalid input.',
        status,
        fieldErrors,
      }) as ApiError;
    }

    if (status >= 500) {
      return Object.assign(new Error('Something went wrong on our end.'), {
        kind: 'server' as const,
        message: 'Something went wrong on our end.',
        status,
      }) as ApiError;
    }

    return Object.assign(new Error(message ?? 'Unexpected error.'), {
      kind: 'unknown' as const,
      message: message ?? 'Unexpected error.',
      status,
    }) as ApiError;
  }

  // Unknown error type
  const msg = error instanceof Error ? error.message : 'Unexpected error.';
  return Object.assign(new Error(msg), {
    kind: 'unknown' as const,
    message: msg,
  }) as ApiError;
}
