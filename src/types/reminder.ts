/**
 * Domain model for a reminder. Mirrors the backend contract documented in
 * docs/05-backend-integration.md — adjust field names to your actual API.
 */
export interface Reminder {
  id: string;
  title: string;
  body?: string;
  /** ISO-8601 timestamp of when the reminder should fire. */
  remindAt: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderInput {
  title: string;
  body?: string;
  remindAt: string;
}

export type UpdateReminderInput = Partial<CreateReminderInput> & {
  completed?: boolean;
};
