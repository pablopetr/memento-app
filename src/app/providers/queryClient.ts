import {QueryClient} from '@tanstack/react-query';

/**
 * Single QueryClient for the app. Defaults tuned for a mobile reminder app:
 * data is considered fresh for a short window and retried a couple of times
 * on transient failures (see docs/10-error-handling.md for the retry policy).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
