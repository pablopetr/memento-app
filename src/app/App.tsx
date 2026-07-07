import {NavigationContainer} from '@react-navigation/native';
import {QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AuthProvider} from '../features/auth/AuthContext';
import {linking} from './navigation/linking';
import {RootNavigator} from './navigation/RootNavigator';
import {queryClient} from './providers/queryClient';

/**
 * Composition root: mounts every provider exactly once, each with a single
 * responsibility. Order matters — SafeArea and QueryClient wrap Auth, which
 * wraps navigation so the RootNavigator can read auth state.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer linking={linking}>
            <StatusBar barStyle="dark-content" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
