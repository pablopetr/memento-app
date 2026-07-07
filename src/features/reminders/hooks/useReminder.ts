import {useQuery} from '@tanstack/react-query';

import {getReminder} from '../../../services/reminders/reminderService';

/** Query key for a single reminder, invalidated after an edit. */
export const reminderQueryKey = (id: string) => ['reminder', id] as const;

/**
 * Fetches one reminder by id to pre-fill the edit form. Disabled when no id is
 * provided (create mode).
 */
export function useReminder(id: string | undefined) {
  return useQuery({
    queryKey: reminderQueryKey(id ?? ''),
    queryFn: () => getReminder(id as string),
    enabled: !!id,
  });
}
