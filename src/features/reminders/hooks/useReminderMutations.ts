import {useMutation, useQueryClient} from '@tanstack/react-query';

import {
  createReminder,
  deleteReminder,
  updateReminder,
} from '../../../services/reminders/reminderService';
import {ReminderInput} from '../../../types/reminder';
import {RemindersData, removeReminderFromPages} from '../cache';
import {reminderQueryKey} from './useReminder';
import {remindersQueryKey} from './useReminders';

/** Create a reminder, then refresh the dashboard list. */
export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReminderInput) => createReminder(input),
    onSuccess: () => qc.invalidateQueries({queryKey: remindersQueryKey}),
  });
}

/** Update a reminder, then refresh both the list and its detail cache. */
export function useUpdateReminder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReminderInput) => updateReminder(id, input),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: remindersQueryKey});
      qc.invalidateQueries({queryKey: reminderQueryKey(id)});
    },
  });
}

/**
 * Delete a reminder with an optimistic removal from the cached list so the UI
 * feels instant; roll back the snapshot on error and re-sync on settle.
 */
export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReminder(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({queryKey: remindersQueryKey});
      const previous = qc.getQueryData<RemindersData>(remindersQueryKey);
      qc.setQueryData<RemindersData>(
        remindersQueryKey,
        (old: RemindersData | undefined) => removeReminderFromPages(old, id),
      );
      return {previous};
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(remindersQueryKey, context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({queryKey: remindersQueryKey}),
  });
}
