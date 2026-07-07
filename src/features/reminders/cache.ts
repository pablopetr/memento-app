import {InfiniteData} from '@tanstack/react-query';

import {Page} from '../../services/reminders/reminderService';
import {Reminder} from '../../types/reminder';

export type RemindersData = InfiniteData<Page<Reminder>>;

/**
 * Returns a copy of the paginated reminders cache with the given id removed
 * from every page. Used for optimistic deletion (pure, easy to unit-test).
 */
export function removeReminderFromPages(
  data: RemindersData | undefined,
  id: string,
): RemindersData | undefined {
  if (!data) {
    return data;
  }
  return {
    ...data,
    pages: data.pages.map(page => ({
      ...page,
      items: page.items.filter(reminder => reminder.id !== id),
    })),
  };
}
