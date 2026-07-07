import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {format} from 'date-fns';
import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

interface DateTimeFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Presentational date + time picker. Tapping opens the native date picker,
 * then the time picker (cross-platform: both Android dialogs and iOS spinners
 * present sequentially), and reports the combined Date via `onChange`.
 */
export function DateTimeField({
  label,
  value,
  onChange,
  error,
  disabled,
}: DateTimeFieldProps) {
  const [mode, setMode] = useState<'date' | 'time' | null>(null);
  const [draft, setDraft] = useState<Date>(value);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed' || !selected) {
      setMode(null);
      return;
    }
    if (mode === 'date') {
      // Keep the chosen day, then ask for the time.
      const next = new Date(draft);
      next.setFullYear(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
      );
      setDraft(next);
      setMode('time');
      return;
    }
    // mode === 'time' — combine and commit.
    const next = new Date(draft);
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    setMode(null);
    onChange(next);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => {
          setDraft(value);
          setMode('date');
        }}
        style={[styles.field, error ? styles.fieldError : null]}>
        <Text style={styles.value}>
          {format(value, 'EEE, MMM d yyyy · HH:mm')}
        </Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {mode ? (
        <DateTimePicker
          value={draft}
          mode={mode}
          onChange={handleChange}
          minimumDate={mode === 'date' ? new Date() : undefined}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {marginBottom: 16},
  label: {fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6},
  field: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: 'center',
  },
  fieldError: {borderColor: '#dc2626'},
  value: {fontSize: 16, color: '#111827'},
  errorText: {color: '#dc2626', fontSize: 13, marginTop: 6},
});
