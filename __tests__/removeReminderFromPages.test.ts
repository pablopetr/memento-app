/**
 * @format
 */

import {describe, expect, it} from '@jest/globals';

import {
  RemindersData,
  removeReminderFromPages,
} from '../src/features/reminders/cache';
import {Reminder} from '../src/types/reminder';

const reminder = (id: string): Reminder => ({
  id,
  title: `Reminder ${id}`,
  remindAt: new Date().toISOString(),
  repeat: 'none',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const data: RemindersData = {
  pageParams: [undefined, 'cursor-1'],
  pages: [
    {items: [reminder('a'), reminder('b')], nextCursor: 'cursor-1'},
    {items: [reminder('c')], nextCursor: null},
  ],
};

describe('removeReminderFromPages', () => {
  it('removes the reminder from whichever page holds it', () => {
    const result = removeReminderFromPages(data, 'b');
    const ids = result?.pages.flatMap(p => p.items.map(r => r.id));
    expect(ids).toEqual(['a', 'c']);
  });

  it('leaves data unchanged when the id is absent', () => {
    const result = removeReminderFromPages(data, 'zzz');
    const ids = result?.pages.flatMap(p => p.items.map(r => r.id));
    expect(ids).toEqual(['a', 'b', 'c']);
  });

  it('returns undefined when there is no cache yet', () => {
    expect(removeReminderFromPages(undefined, 'a')).toBeUndefined();
  });
});
