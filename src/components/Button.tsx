import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  /** Shows a spinner and blocks presses while a request is in flight. */
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Primary button primitive. Disables itself while `loading` so a form can't be
 * submitted twice.
 */
export function Button({
  title,
  onPress,
  loading,
  disabled,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{disabled: isDisabled, busy: loading}}
      disabled={isDisabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.label}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {opacity: 0.85},
  disabled: {backgroundColor: '#93b4f5'},
  label: {color: '#fff', fontSize: 16, fontWeight: '600'},
});
