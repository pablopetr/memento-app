import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

/**
 * Placeholder create/edit reminder screen. The CRUD form is built in
 * docs/04-reminder-screens.md.
 */
export function ReminderFormScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Reminder form — coming in step 04</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  subtitle: {fontSize: 14, color: '#666'},
});
