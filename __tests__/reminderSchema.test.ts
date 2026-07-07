/**
 * @format
 */

import {describe, expect, it} from '@jest/globals';

import {reminderSchema} from '../src/features/reminders/reminderSchema';

const future = () => new Date(Date.now() + 60 * 60 * 1000);

describe('reminderSchema', () => {
  it('accepts a valid reminder', () => {
    const result = reminderSchema.safeParse({
      title: 'Take medication',
      notes: 'After breakfast',
      remindAt: future(),
      repeat: 'daily',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an empty title', () => {
    const result = reminderSchema.safeParse({
      title: '',
      remindAt: future(),
      repeat: 'none',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Title is required');
    }
  });

  it('rejects a reminder time in the past', () => {
    const result = reminderSchema.safeParse({
      title: 'Late',
      remindAt: new Date(Date.now() - 1000),
      repeat: 'none',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Reminder time must be in the future',
      );
    }
  });
});
