# 9. End-to-End Tests

## Task

Create end-to-end (E2E) tests with **Detox** that drive the real app on a
simulator/emulator, exercising the full user flows: login → dashboard → create →
edit → delete, plus notification deep-link handling. These complement the unit
tests by verifying integration and navigation.

## Dependencies / libraries

- `detox` — gray-box E2E for React Native.
- `jest` — Detox's test runner.
- `jest-circus` — runner Detox expects.
- Optional: a **mock backend** (MSW native, or a seeded staging API) so runs are
  deterministic.

## Setup

1. Install and init:

   ```bash
   npm i -D detox jest-circus
   npx detox init
   ```

2. Configure `.detoxrc.js` with your app binary paths and devices (iOS
   simulator, Android emulator). Add build/test scripts:

   ```json
   {
     "scripts": {
       "e2e:build:ios": "detox build -c ios.sim.debug",
       "e2e:test:ios": "detox test -c ios.sim.debug"
     }
   }
   ```

3. Add stable `testID` props to interactive elements (Detox matches on these):

   ```tsx
   <TextField testID="login-email" ... />
   <Button testID="login-submit" ... />
   <Fab testID="dashboard-fab" ... />
   ```

## Determinism strategy

E2E flakiness usually comes from the network and time. Mitigate:

- **Backend:** point the app at a seeded test API, or launch with a mock server.
  Pass config via `device.launchApp({ launchArgs: { apiUrl } })`.
- **Auth:** use a known seeded test account, or inject a token on launch to skip
  login where not under test.
- **Notifications:** Detox can deliver a push payload to the app —
  `device.sendUserNotification(...)` / `device.launchApp({ userNotification })` —
  to test deep-link handling without a live FCM round-trip.

## Scenarios

### 1. Login flow

```js
describe('Login', () => {
  beforeAll(async () => device.launchApp({ newInstance: true }));

  it('logs in with valid credentials and shows the dashboard', async () => {
    await element(by.id('login-email')).typeText('test@memento.app');
    await element(by.id('login-password')).typeText('password123');
    await element(by.id('login-submit')).tap();
    await expect(element(by.id('dashboard-list'))).toBeVisible();
  });

  it('shows an error on wrong credentials', async () => {
    await element(by.id('login-password')).clearText();
    await element(by.id('login-password')).typeText('wrong');
    await element(by.id('login-submit')).tap();
    await expect(element(by.text(/invalid credentials/i))).toBeVisible();
  });
});
```

### 2. Create → appears on dashboard

```js
it('creates a reminder', async () => {
  await element(by.id('dashboard-fab')).tap();
  await element(by.id('reminder-title')).typeText('Water the plants');
  await element(by.id('reminder-submit')).tap();
  await expect(element(by.text('Water the plants'))).toBeVisible();
});
```

### 3. Edit an existing reminder

```js
it('edits a reminder title', async () => {
  await element(by.text('Water the plants')).tap();
  await element(by.id('reminder-title')).replaceText('Water the garden');
  await element(by.id('reminder-submit')).tap();
  await expect(element(by.text('Water the garden'))).toBeVisible();
});
```

### 4. Delete with confirmation

```js
it('deletes a reminder', async () => {
  await element(by.text('Water the garden')).tap();
  await element(by.id('reminder-delete')).tap();
  await element(by.text('Delete')).tap();      // confirm alert
  await expect(element(by.text('Water the garden'))).not.toBeVisible();
});
```

### 5. Pull-to-refresh

```js
it('refreshes the list', async () => {
  await element(by.id('dashboard-list')).swipe('down', 'fast');
  await expect(element(by.id('dashboard-list'))).toBeVisible();
});
```

### 6. Notification deep link (killed state)

```js
it('opens the reminder when launched from a notification', async () => {
  await device.launchApp({
    newInstance: true,
    userNotification: {
      trigger: { type: 'push' },
      payload: { reminderId: 'seed-123', title: 'Take medication' },
    },
  });
  await expect(element(by.id('reminder-title'))).toHaveText('Take medication');
});
```

## CI integration

- Run on macOS runners for iOS, Linux for Android emulator.
- Cache the built app binary; `detox build` then `detox test`.
- Record artifacts (screenshots/videos) on failure via Detox's
  `--record-videos failing`.
- Keep E2E on the critical paths only (login, CRUD, notification) — they are
  slow; breadth belongs to [08-unit-tests.md](./08-unit-tests.md).

## Definition of done

- The five core flows plus the notification deep-link run green on both
  platforms locally and in CI.
- Tests are deterministic (seeded/mock backend, no reliance on live FCM timing).
