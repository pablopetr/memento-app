import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {Reminder} from '../../../types/reminder';
import {formatReminderTime} from '../../../utils/formatReminderTime';

interface ReminderCardProps {
  reminder: Reminder;
  onPress: (id: string) => void;
}

/**
 * Single reminder row. Memoized so a re-render of the list (e.g. refetch)
 * doesn't re-render unchanged cards — cheap virtualized scrolling
 * (see docs/11-performance-optimization.md).
 */
function ReminderCardComponent({reminder, onPress}: ReminderCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(reminder.id)}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.title}>
          {reminder.title}
        </Text>
        <Text style={styles.time}>{formatReminderTime(reminder.remindAt)}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export const ReminderCard = React.memo(ReminderCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  pressed: {opacity: 0.7},
  body: {flex: 1, gap: 4},
  title: {fontSize: 16, fontWeight: '600', color: '#111827'},
  time: {fontSize: 13, color: '#6b7280'},
  chevron: {fontSize: 24, color: '#9ca3af', marginLeft: 8},
});
