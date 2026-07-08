import {QueryClient} from '@tanstack/react-query';

import {ApiError} from '../../types/api';

/**
 * Single QueryClient for the app. Error-aware retry: retry on transient
 * network/timeout errors (up to 2 times), but not on auth/validation/server
 * errors since retrying won't help. Fresh data expires after 30 seconds.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error: unknown) => {
        const apiError = error as ApiError | undefined;
        // Retry only on transient network/timeout errors.
        if (apiError?.kind === 'network' || apiError?.kind === 'timeout') {
          return count < 2;
        }
        // Don't retry auth/validation/server/unknown errors.
        return false;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
