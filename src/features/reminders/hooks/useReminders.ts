import {useInfiniteQuery} from '@tanstack/react-query';

import {fetchReminders} from '../../../services/reminders/reminderService';

/** Query key shared by the list query and the mutations that invalidate it. */
export const remindersQueryKey = ['reminders'] as const;

/**
 * Paginated reminders feed. `useInfiniteQuery` owns paging, caching, refetch
 * and retries; the screen stays presentational. `getNextPageParam` returning
 * undefined stops `fetchNextPage` at the end of the list.
 */
export function useReminders() {
  return useInfiniteQuery({
    queryKey: remindersQueryKey,
    queryFn: ({pageParam}) => fetchReminders(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: last => last.nextCursor ?? undefined,
  });
}
