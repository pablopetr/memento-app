# 3. Dashboard Screen

## Task

Build the home dashboard that lists the authenticated user's reminders, fetched
from the backend. Support **infinite scrolling** (paginated fetch),
**pull-to-refresh**, empty/loading/error states, and a floating action button
to create a new reminder.

## Dependencies / libraries

- `@tanstack/react-query` — `useInfiniteQuery` handles paging, caching, refetch.
- `FlatList` (React Native core) — virtualized list.
- `date-fns` — human-friendly reminder times ("in 2 hours", "Tomorrow 09:00").

## UI layout

```
┌────────────────────────────┐
│  Reminders            (⏻)  │  ← header + logout
│ ┌────────────────────────┐ │
│ │ 💊 Take medication     │ │
│ │ Today 20:00        ▸   │ │  ← ReminderCard (tap → edit)
│ ├────────────────────────┤ │
│ │ 📞 Call dentist        │ │
│ │ Tomorrow 09:00     ▸   │ │
│ └────────────────────────┘ │
│         ...scroll...        │
│                      ( + )  │  ← FAB → Create screen
└────────────────────────────┘
```

States to render: **loading** (skeleton/spinner), **empty** ("No reminders yet
— tap + to add one"), **error** (retry button), **loaded** (list).

## Data layer

Service call (paginated — assumes cursor or page params; see
[05-backend-integration.md](./05-backend-integration.md)):

```ts
// src/services/reminders/reminderService.ts
export interface Page<T> { items: T[]; nextCursor: string | null; }

export async function fetchReminders(cursor?: string): Promise<Page<Reminder>> {
  const { data } = await apiClient.get('/reminders', {
    params: { cursor, limit: 20 },
  });
  return data; // { items: Reminder[], nextCursor: string | null }
}
```

Query hook (single responsibility — data only):

```ts
// src/features/reminders/hooks/useReminders.ts
export function useReminders() {
  return useInfiniteQuery({
    queryKey: ['reminders'],
    queryFn: ({ pageParam }) => fetchReminders(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}
```

## Screen implementation

```tsx
export function DashboardScreen() {
  const {
    data, isLoading, isError, refetch, isRefetching,
    fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useReminders();

  const reminders = data?.pages.flatMap(p => p.items) ?? [];

  if (isLoading) return <ReminderListSkeleton />;
  if (isError)   return <ErrorState onRetry={refetch} />;

  return (
    <ScreenContainer>
      <FlatList
        data={reminders}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <ReminderCard reminder={item} />}
        ListEmptyComponent={<EmptyReminders />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <Spinner /> : null}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      />
      <Fab onPress={() => navigation.navigate('CreateReminder')} />
    </ScreenContainer>
  );
}
```

## Key points

- **Pagination:** `useInfiniteQuery` + `onEndReached`. `getNextPageParam`
  returning `undefined` stops further fetches.
- **Pull-to-refresh:** `RefreshControl` bound to `refetch` / `isRefetching`.
- **Cache invalidation:** after create/edit/delete, the reminder mutations call
  `queryClient.invalidateQueries({ queryKey: ['reminders'] })` so the list
  updates automatically (see [04-reminder-screens.md](./04-reminder-screens.md)).
- **Performance:** `ReminderCard` is `React.memo`; stable `keyExtractor`; avoid
  inline anonymous heavy work (see
  [11-performance-optimization.md](./11-performance-optimization.md)).

## Definition of done

- Reminders load and render; scrolling to the bottom fetches the next page.
- Pull-to-refresh re-fetches from the top.
- Empty, loading, and error states each render correctly.
- Creating/editing/deleting a reminder reflects on the dashboard without a
  manual reload.
