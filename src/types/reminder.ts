/** How often a reminder repeats. */
export type RepeatInterval = 'none' | 'daily' | 'weekly' | 'monthly';

/**
 * Domain model for a reminder as returned by the backend. Mirrors the contract
 * in docs/04-reminder-screens.md / docs/05-backend-integration.md — the server
 * owns scheduling, so `remindAt` is an ISO-8601 UTC timestamp.
 */
export interface Reminder {
  id: string;
  title: string;
  notes?: string;
  /** ISO-8601 (UTC) time the reminder should fire. */
  remindAt: string;
  repeat: RepeatInterval;
  createdAt: string;
  updatedAt: string;
}

/**
 * User-supplied reminder data before it hits the network. `remindAt` is a
 * `Date` here (picker output); the service serializes it to ISO UTC. Defined in
 * the types layer so services depend only on types, never on feature code —
 * the form's `ReminderForm` structurally satisfies this shape.
 */
export interface ReminderInput {
  title: string;
  notes?: string;
  remindAt: Date;
  repeat: RepeatInterval;
}
