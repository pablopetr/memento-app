import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

import {useAuth} from '../../features/auth/AuthContext';
import {AuthStack} from './AuthStack';
import {MainStack} from './MainStack';

/**
 * Chooses the top-level stack based on auth state. While the stored session
 * is being resolved on boot we show a spinner to avoid flashing the login
 * screen for already-signed-in users.
 */
export function RootNavigator() {
  const {isAuthenticated, isBootstrapping} = useAuth();

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
