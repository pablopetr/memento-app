import React, {forwardRef, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  /** Validation/server error shown beneath the field. */
  error?: string;
  /** Renders a masked input with a show/hide toggle. */
  secureTextEntry?: boolean;
}

/**
 * Labeled text input primitive. Presentational: it receives value/handlers and
 * an optional error string; it owns only the password visibility toggle.
 *
 * Forwards its ref so screens can chain focus (email → password).
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({label, error, secureTextEntry, ...inputProps}, ref) => {
    const [hidden, setHidden] = useState(true);
    const isSecure = secureTextEntry && hidden;

    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputRow, error ? styles.inputError : null]}>
          <TextInput
            ref={ref}
            style={styles.input}
            placeholderTextColor="#9ca3af"
            secureTextEntry={isSecure}
            {...inputProps}
          />
          {secureTextEntry ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setHidden(prev => !prev)}>
              <Text style={styles.toggle}>{hidden ? 'Show' : 'Hide'}</Text>
            </Pressable>
          ) : null}
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  },
);

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  wrapper: {marginBottom: 16},
  label: {fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputError: {borderColor: '#dc2626'},
  input: {flex: 1, fontSize: 16, color: '#111827'},
  toggle: {color: '#2563eb', fontWeight: '600', fontSize: 14},
  errorText: {color: '#dc2626', fontSize: 13, marginTop: 6},
});
