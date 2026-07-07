# 4. Create / Edit / Delete Reminder Screens

## Task

Implement the reminder CRUD screens: a shared form for **creating** and
**editing** a reminder, plus a **delete** action with confirmation. Each
operation calls the backend, schedules/reschedules the server-side reminder
trigger, and keeps the dashboard cache in sync.

## Dependencies / libraries

- `react-hook-form` + `zod` — form + validation (schema shared with the API type).
- `@react-native-community/datetimepicker` — date/time selection.
- `@tanstack/react-query` — `useMutation` with cache invalidation.

## Reminder model

```ts
// src/types/reminder.ts
export interface Reminder {
  id: string;
  title: string;
  notes?: string;
  remindAt: string;      // ISO 8601, UTC
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  updatedAt: string;
}
```

## Shared validation schema

```ts
// src/features/reminders/reminderSchema.ts
import { z } from 'zod';

export const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
  notes: z.string().max(1000).optional(),
  remindAt: z.date().refine(d => d.getTime() > Date.now(),
    'Reminder time must be in the future'),
  repeat: z.enum(['none', 'daily', 'weekly', 'monthly']),
});

export type ReminderForm = z.infer<typeof reminderSchema>;
```

## Reusable form component (DRY)

Both Create and Edit render the same `<ReminderForm>`, differing only in
`defaultValues` and the submit handler — Single Responsibility + DRY.

```tsx
// src/features/reminders/components/ReminderFormView.tsx
export function ReminderFormView({ defaultValues, submitLabel, onSubmit, isSubmitting }) {
  const { control, handleSubmit, formState: { errors } } =
    useForm<ReminderForm>({ resolver: zodResolver(reminderSchema), defaultValues });

  return (
    <ScreenContainer>
      <TextField name="title" control={control} label="Title"
        error={errors.title?.message} />
      <TextField name="notes" control={control} label="Notes" multiline
        error={errors.notes?.message} />
      <DateTimeField name="remindAt" control={control} label="Remind me at"
        error={errors.remindAt?.message} />
      <RepeatPicker name="repeat" control={control} />
      <Button title={submitLabel} loading={isSubmitting}
        onPress={handleSubmit(onSubmit)} />
    </ScreenContainer>
  );
}
```

## Mutations

```ts
// src/features/reminders/hooks/useReminderMutations.ts
export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReminderForm) => reminderService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
}

export function useUpdateReminder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ReminderForm) => reminderService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reminders'] });
      qc.invalidateQueries({ queryKey: ['reminder', id] });
    },
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reminderService.remove(id),
    // Optimistic removal for snappy UX (see rollback in onError).
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['reminders'] });
      const prev = qc.getQueryData(['reminders']);
      qc.setQueryData(['reminders'], (old: any) => removeFromPages(old, id));
      return { prev };
    },
    onError: (_e, _id, ctx) => qc.setQueryData(['reminders'], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ['reminders'] }),
  });
}
```

## Service (CRUD calls)

```ts
// src/services/reminders/reminderService.ts
export const reminderService = {
  create: (input: ReminderForm) =>
    apiClient.post('/reminders', serialize(input)).then(r => r.data),
  update: (id: string, input: ReminderForm) =>
    apiClient.put(`/reminders/${id}`, serialize(input)).then(r => r.data),
  remove: (id: string) => apiClient.delete(`/reminders/${id}`),
  getById: (id: string) =>
    apiClient.get(`/reminders/${id}`).then(r => r.data),
};

// Convert Date → ISO UTC before sending; server owns scheduling.
const serialize = (i: ReminderForm) => ({ ...i, remindAt: i.remindAt.toISOString() });
```

## Scheduling

The **backend owns scheduling**: creating/updating a reminder with `remindAt`
registers the server-side trigger that later dispatches an FCM push (see
[06-firebase-setup.md](./06-firebase-setup.md) and
[07-notification-handling.md](./07-notification-handling.md)). The client only
sends the desired time in UTC; the device timezone is applied for display.

## Screens

- **CreateReminderScreen** — empty defaults, `useCreateReminder`, on success
  `navigation.goBack()`.
- **EditReminderScreen** — receives `reminderId` param, loads via
  `useReminder(id)`, pre-fills the form, uses `useUpdateReminder`.
- **Delete** — triggered from Edit (or a swipe action on the dashboard). Show a
  confirmation `Alert` before calling `useDeleteReminder`. Do **not** trigger
  JS `confirm()` — use React Native's `Alert.alert`.

## Definition of done

- Create adds a reminder, returns to dashboard, list shows it.
- Edit pre-fills existing values and persists changes.
- Delete asks for confirmation, removes optimistically, rolls back on failure.
- Past date/time and empty title are blocked by validation before any request.
