import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

/** Shown when the user has no reminders yet. */
export function EmptyReminders() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔔</Text>
      <Text style={styles.title}>No reminders yet</Text>
      <Text style={styles.subtitle}>Tap + to add your first one.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: 8,
  },
  emoji: {fontSize: 40},
  title: {fontSize: 18, fontWeight: '600', color: '#374151'},
  subtitle: {fontSize: 14, color: '#6b7280'},
});
