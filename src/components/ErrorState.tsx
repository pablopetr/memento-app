import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Button} from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

/** Generic full-screen error with a retry action. Reused across screens. */
export function ErrorState({message, onRetry}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>
        {message ?? 'We could not load your data.'}
      </Text>
      <Button title="Try again" onPress={onRetry} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  title: {fontSize: 18, fontWeight: '600', color: '#374151'},
  message: {fontSize: 14, color: '#6b7280', textAlign: 'center'},
  button: {marginTop: 16, alignSelf: 'stretch'},
});
