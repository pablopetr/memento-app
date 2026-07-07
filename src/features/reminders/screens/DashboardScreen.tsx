import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

/**
 * Placeholder dashboard. The reminder list with pagination and
 * pull-to-refresh is built in docs/03-dashboard-screen.md.
 */
export function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reminders</Text>
      <Text style={styles.subtitle}>Dashboard — coming in step 03</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8},
  title: {fontSize: 24, fontWeight: '700'},
  subtitle: {fontSize: 14, color: '#666'},
});
