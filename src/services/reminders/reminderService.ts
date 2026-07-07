import {apiClient} from '../api/client';
import {endpoints} from '../api/endpoints';
import {
  CreateReminderInput,
  Reminder,
  UpdateReminderInput,
} from '../../types/reminder';

/**
 * A single cursor-paginated page of results. `nextCursor` is null when there
 * are no more pages (drives `getNextPageParam` in the infinite query).
 */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/**
 * CRUD calls for reminders. Pure networking logic — pagination, retries and
 * caching are handled by the TanStack Query hooks that consume this
 * (see docs/03-dashboard-screen.md and docs/04-reminder-screens.md).
 */
export async function fetchReminders(cursor?: string): Promise<Page<Reminder>> {
  const {data} = await apiClient.get<Page<Reminder>>(endpoints.reminders.list, {
    params: {cursor, limit: 20},
  });
  return data;
}

export async function getReminder(id: string) {
  const {data} = await apiClient.get<Reminder>(endpoints.reminders.detail(id));
  return data;
}

export async function createReminder(input: CreateReminderInput) {
  const {data} = await apiClient.post<Reminder>(
    endpoints.reminders.list,
    input,
  );
  return data;
}

export async function updateReminder(id: string, input: UpdateReminderInput) {
  const {data} = await apiClient.patch<Reminder>(
    endpoints.reminders.detail(id),
    input,
  );
  return data;
}

export async function deleteReminder(id: string): Promise<void> {
  await apiClient.delete(endpoints.reminders.detail(id));
}
