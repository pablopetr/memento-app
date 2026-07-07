import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

/**
 * Placeholder login screen. The real form (validation, JWT storage) is built
 * in docs/02-login-screen.md — this exists so the auth stack is navigable.
 */
export function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memento</Text>
      <Text style={styles.subtitle}>Login screen — coming in step 02</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8},
  title: {fontSize: 28, fontWeight: '700'},
  subtitle: {fontSize: 14, color: '#666'},
});
