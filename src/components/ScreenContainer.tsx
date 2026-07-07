import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  /** Center children vertically (used by simple form screens like Login). */
  centered?: boolean;
  style?: ViewStyle;
}

/**
 * Shared page wrapper: applies safe-area padding and avoids the keyboard so
 * form screens don't get covered. Presentational only.
 */
export function ScreenContainer({
  children,
  centered = false,
  style,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View
        style={[
          styles.container,
          {paddingTop: insets.top, paddingBottom: insets.bottom},
          centered && styles.centered,
          style,
        ]}>
        {children}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {flex: 1, paddingHorizontal: 24, backgroundColor: '#fff'},
  centered: {justifyContent: 'center'},
});
