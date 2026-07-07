import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {RepeatInterval} from '../../../types/reminder';

interface RepeatPickerProps {
  label: string;
  value: RepeatInterval;
  onChange: (value: RepeatInterval) => void;
}

const OPTIONS: {value: RepeatInterval; label: string}[] = [
  {value: 'none', label: 'None'},
  {value: 'daily', label: 'Daily'},
  {value: 'weekly', label: 'Weekly'},
  {value: 'monthly', label: 'Monthly'},
];

/** Segmented control for the repeat interval. */
export function RepeatPicker({label, value, onChange}: RepeatPickerProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {OPTIONS.map(option => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{selected}}
              onPress={() => onChange(option.value)}
              style={[styles.chip, selected && styles.chipSelected]}>
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {marginBottom: 16},
  label: {fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6},
  row: {flexDirection: 'row', gap: 8},
  chip: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {backgroundColor: '#2563eb', borderColor: '#2563eb'},
  chipText: {fontSize: 14, color: '#374151', fontWeight: '500'},
  chipTextSelected: {color: '#fff'},
});
