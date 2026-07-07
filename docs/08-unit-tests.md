# 8. Unit Tests

## Task

Write unit tests for components, hooks, and services using **Jest** and
**React Native Testing Library (RNTL)**. Cover validation logic, rendering
states, and API-service behavior with mocks so tests are fast and deterministic.

## Dependencies / libraries

- `jest` (bundled with React Native preset).
- `@testing-library/react-native` — render + query components by role/text.
- `@testing-library/jest-native` — matchers (`toBeVisible`, `toBeDisabled`).
- `msw` (Mock Service Worker) *or* `axios-mock-adapter` — mock HTTP.
- `jest.mock` — mock native modules (Keychain, Firebase, Notifee).

## Setup

`jest.config.js`:

```js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', '<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|@notifee|@react-native-firebase)/)',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
```

`jest.setup.ts` — mock native modules that can't run in Node:

```ts
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(), getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
}));
jest.mock('@react-native-firebase/messaging', () => () => ({
  requestPermission: jest.fn(), getToken: jest.fn(() => Promise.resolve('tok')),
  onMessage: jest.fn(() => jest.fn()), onTokenRefresh: jest.fn(() => jest.fn()),
}));
jest.mock('@notifee/react-native', () => ({
  createChannel: jest.fn(), displayNotification: jest.fn(),
  onForegroundEvent: jest.fn(() => jest.fn()),
}));
```

## Test targets & cases

### Validation schemas (pure — highest ROI)

```ts
// reminderSchema.test.ts
it('rejects a past remindAt', () => {
  const result = reminderSchema.safeParse({
    title: 'X', remindAt: new Date(Date.now() - 1000), repeat: 'none',
  });
  expect(result.success).toBe(false);
});
it('requires a title', () => {
  expect(reminderSchema.safeParse({ title: '', remindAt: future, repeat: 'none' }).success)
    .toBe(false);
});
```

### Services (mock HTTP)

```ts
// reminderService.test.ts
it('serializes remindAt to ISO before POST', async () => {
  const spy = jest.spyOn(apiClient, 'post').mockResolvedValue({ data: {} });
  await reminderService.create({ title: 'A', remindAt: new Date('2030-01-01'), repeat: 'none' });
  expect(spy).toHaveBeenCalledWith('/reminders',
    expect.objectContaining({ remindAt: '2030-01-01T00:00:00.000Z' }));
});
```

```ts
// errors.test.ts
it('maps a 401 to unauthorized', () => {
  expect(toApiError({ response: { status: 401 } }).kind).toBe('unauthorized');
});
it('maps a missing response to network', () => {
  expect(toApiError({}).kind).toBe('network');
});
```

### Components (RNTL)

```tsx
// LoginScreen.test.tsx
it('shows a validation error for an invalid email', async () => {
  render(<LoginScreen />, { wrapper: TestProviders });
  fireEvent.changeText(screen.getByLabelText('Email'), 'not-an-email');
  fireEvent.press(screen.getByText('Log in'));
  expect(await screen.findByText('Enter a valid email')).toBeVisible();
});
```

```tsx
// DashboardScreen.test.tsx
it('renders the empty state when there are no reminders', async () => {
  server.use(rest.get('*/reminders', (_, res, ctx) =>
    res(ctx.json({ items: [], nextCursor: null }))));
  render(<DashboardScreen />, { wrapper: TestProviders });
  expect(await screen.findByText(/No reminders yet/i)).toBeVisible();
});
```

### Hooks (renderHook + QueryClient)

```tsx
// useReminders.test.tsx
it('flattens paginated results', async () => {
  const { result } = renderHook(() => useReminders(), { wrapper: TestProviders });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.pages[0].items).toHaveLength(20);
});
```

## Mocking strategy

- **Native modules:** mocked globally in `jest.setup.ts`.
- **Network:** `msw` for hooks/screens (realistic); `jest.spyOn` for unit-level
  service assertions.
- **Navigation:** wrap screens in a `NavigationContainer` test helper or mock
  `useNavigation`.
- **Providers:** a shared `TestProviders` wrapper (QueryClient with retries off,
  AuthProvider stub) keeps tests DRY.

```tsx
export const TestProviders = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <NavigationContainer>{children}</NavigationContainer>
  </QueryClientProvider>
);
```

## Conventions

- Query by **accessible role/label/text**, not by test IDs where possible.
- One behavior per test; arrange–act–assert.
- Target ~80% coverage on `services/` and validation; components cover the
  loading/empty/error/success branches.

## Definition of done

- `npm test` runs green in CI with coverage thresholds enforced.
- Every schema, the API-error mapper, and each screen's state branches are
  covered.
