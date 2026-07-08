import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AuthProvider} from '../../src/features/auth/AuthContext';

/**
 * Shared wrapper for component tests. Includes:
 * - QueryClient with retries disabled (tests run fast)
 * - NavigationContainer (required for navigation-using components)
 * - SafeAreaProvider (required by screen components)
 * - AuthProvider stub (provides auth context)
 */
export function TestProviders({children}: {children: React.ReactNode}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AuthProvider>{children}</AuthProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
