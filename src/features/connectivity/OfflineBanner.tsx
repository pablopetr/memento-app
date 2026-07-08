import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface OfflineBannerProps {
  visible: boolean;
}

/**
 * Persistent banner displayed at the top of the app when the device is offline.
 * Disappears when connectivity is restored.
 */
export function OfflineBanner({visible}: OfflineBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fee2e2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {fontSize: 13, color: '#991b1b', fontWeight: '500'},
});
