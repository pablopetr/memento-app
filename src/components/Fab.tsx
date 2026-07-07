import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

interface FabProps {
  onPress: () => void;
  accessibilityLabel: string;
}

/** Floating action button anchored bottom-right (e.g. "create reminder"). */
export function Fab({onPress, accessibilityLabel}: FabProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({pressed}) => [styles.fab, pressed && styles.pressed]}>
      <Text style={styles.plus}>＋</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  pressed: {opacity: 0.85},
  plus: {color: '#fff', fontSize: 28, lineHeight: 30, fontWeight: '600'},
});
