import {apiClient} from '../api/client';
import {endpoints} from '../api/endpoints';
import {Paginated} from '../../types/api';
import {
  CreateReminderInput,
  Reminder,
  UpdateReminderInput,
} from '../../types/reminder';

/**
 * CRUD calls for reminders. Pure networking logic — pagination, retries and
 * caching are handled by the TanStack Query hooks that consume this
 * (see docs/03-dashboard-screen.md and docs/04-reminder-screens.md).
 */
export async function listReminders(page = 1, pageSize = 20) {
  const {data} = await apiClient.get<Paginated<Reminder>>(
    endpoints.reminders.list,
    {params: {page, pageSize}},
  );
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
