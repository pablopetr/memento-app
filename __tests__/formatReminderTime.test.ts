/**
 * @format
 */

import {describe, expect, it} from '@jest/globals';

import {formatReminderTime} from '../src/utils/formatReminderTime';

describe('formatReminderTime', () => {
  it('labels today with a Today prefix', () => {
    const today = new Date();
    today.setHours(20, 0, 0, 0);
    expect(formatReminderTime(today.toISOString())).toBe('Today 20:00');
  });

  it('labels tomorrow with a Tomorrow prefix', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 5, 0, 0);
    expect(formatReminderTime(tomorrow.toISOString())).toBe('Tomorrow 09:05');
  });

  it('returns an empty string for an invalid date', () => {
    expect(formatReminderTime('not-a-date')).toBe('');
  });
});
