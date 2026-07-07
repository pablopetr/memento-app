import React from 'react';
import {StyleSheet, View} from 'react-native';

/**
 * Lightweight placeholder rows shown while the first page loads, so the
 * dashboard doesn't flash an empty screen or a bare spinner.
 */
export function ReminderListSkeleton() {
  return (
    <View style={styles.container}>
      {Array.from({length: 6}).map((_, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.lineWide} />
          <View style={styles.lineNarrow} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {paddingTop: 8},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  lineWide: {
    height: 14,
    width: '60%',
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
  },
  lineNarrow: {
    height: 12,
    width: '35%',
    borderRadius: 6,
    backgroundColor: '#eef1f4',
  },
});
