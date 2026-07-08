import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface InlineErrorProps {
  message?: string;
}

/**
 * Small error message displayed directly under a form field. Replaces the
 * separate TextField error property for cases where errors come from the server.
 */
export function InlineError({message}: InlineErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginTop: 6, marginBottom: 8},
  text: {color: '#dc2626', fontSize: 13},
});
