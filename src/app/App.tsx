import {NavigationContainer} from '@react-navigation/native';
import {QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AuthProvider} from '../features/auth/AuthContext';
import {OfflineBanner} from '../features/connectivity/OfflineBanner';
import {useOnlineStatus} from '../features/connectivity/useOnlineStatus';
import {linking} from './navigation/linking';
import {RootNavigator} from './navigation/RootNavigator';
import {ErrorBoundary} from './ErrorBoundary';
import {queryClient} from './providers/queryClient';

/**
 * Inner component that has access to useOnlineStatus hook.
 */
function AppContent() {
  const isOnline = useOnlineStatus();

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="dark-content" />
      <OfflineBanner visible={!isOnline} />
      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
});

/**
 * Composition root: mounts every provider exactly once, each with a single
 * responsibility. Order matters — SafeArea and QueryClient wrap Auth, which
 * wraps navigation so the RootNavigator can read auth state. ErrorBoundary
 * wraps the entire tree to catch crashes.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NavigationContainer linking={linking}>
              <AppContent />
            </NavigationContainer>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
