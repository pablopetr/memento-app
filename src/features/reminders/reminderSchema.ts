import {z} from 'zod';

/**
 * Single source of truth for the reminder form: drives validation and the
 * `ReminderForm` type (DRY). Note `remindAt` is a `Date` in the form (picker
 * output); the service serializes it to ISO-8601 UTC before sending.
 */
export const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  notes: z.string().max(1000).optional(),
  remindAt: z
    .date()
    .refine(
      d => d.getTime() > Date.now(),
      'Reminder time must be in the future',
    ),
  repeat: z.enum(['none', 'daily', 'weekly', 'monthly']),
});

export type ReminderForm = z.infer<typeof reminderSchema>;
