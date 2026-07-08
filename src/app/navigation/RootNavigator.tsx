import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

import {useAuth} from '../../features/auth/AuthContext';
import {useNotifications} from '../../features/notifications/useNotifications';
import {useNotificationNavigation} from '../../features/notifications/useNotificationNavigation';
import {AuthStack} from './AuthStack';
import {MainStack} from './MainStack';

/**
 * Chooses the top-level stack based on auth state. While the stored session
 * is being resolved on boot we show a spinner to avoid flashing the login
 * screen for already-signed-in users.
 *
 * Also mounts the notification hooks so they listen for FCM messages and
 * handle taps across all app states.
 */
export function RootNavigator() {
  const {isAuthenticated, isBootstrapping} = useAuth();

  // Listen for foreground messages and token refreshes.
  useNotifications();

  // Handle notification taps from killed/background/foreground states.
  useNotificationNavigation();

  if (isBootstrapping) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isAuthenticated ? <MainStack /> : <AuthStack />;
}

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});
