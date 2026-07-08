/**
 * E2E test scenarios for critical user flows: login, create, edit, delete, refresh.
 * Run with: npm run e2e:test:ios or npm run e2e:test:android
 *
 * Note: These tests assume:
 * - A seeded test backend or mock API (pass via launchArgs)
 * - Test credentials: test@memento.app / password123
 * - Detox is built and running on a simulator/emulator
 */

describe('Memento E2E Flows', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: {apiUrl: 'http://localhost:3001'}, // point to test backend
    });
  });

  describe('Login', () => {
    it('logs in with valid credentials and shows the dashboard', async () => {
      // Fill in credentials
      await element(by.id('login-email')).typeText('test@memento.app');
      await element(by.id('login-password')).typeText('password123');

      // Submit
      await element(by.id('login-submit')).tap();

      // Verify dashboard appears
      await waitFor(element(by.id('dashboard-list')))
        .toBeVisible()
        .withTimeout(5000);
      await expect(element(by.text(/Reminders/i))).toBeVisible();
    });
  });

  describe('Create Reminder', () => {
    it('creates a reminder via FAB', async () => {
      // Tap FAB to open create form
      await element(by.id('dashboard-fab')).tap();

      // Fill in reminder details
      await element(by.id('reminder-title')).typeText('Water the plants');
      await element(by.id('reminder-notes')).typeText('Morning watering');

      // Submit
      await element(by.id('reminder-submit')).tap();

      // Verify it appears on dashboard
      await waitFor(element(by.text('Water the plants')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Edit Reminder', () => {
    it('edits a reminder title', async () => {
      // Tap the reminder to open edit screen
      await element(by.text('Water the plants')).tap();

      // Clear and replace title
      await element(by.id('reminder-title')).replaceText('Water the garden');

      // Submit
      await element(by.id('reminder-submit')).tap();

      // Verify change on dashboard
      await waitFor(element(by.text('Water the garden')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Delete Reminder', () => {
    it('deletes a reminder with confirmation', async () => {
      // Tap reminder to open edit screen
      await element(by.text('Water the garden')).tap();

      // Tap delete button
      await element(by.id('reminder-delete')).tap();

      // Confirm in alert
      await element(by.text('Delete')).atIndex(0).tap();

      // Verify it's gone from dashboard
      await waitFor(element(by.text('Water the garden')))
        .not.toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Pull-to-Refresh', () => {
    it('refreshes the reminder list', async () => {
      // Perform pull-to-refresh gesture
      await element(by.id('dashboard-list')).swipe('down', 'fast');

      // Verify list is still visible (refresh completed)
      await expect(element(by.id('dashboard-list'))).toBeVisible();
    });
  });

  describe('Notification Deep Link', () => {
    it('opens a reminder when app is launched from a notification', async () => {
      // Launch app with a notification payload (simulating killed state)
      await device.launchApp({
        newInstance: true,
        userNotification: {
          trigger: {type: 'push'},
          payload: {
            reminderId: 'seed-reminder-123',
            title: 'Take medication',
            body: 'Time for your morning pills',
          },
        },
      });

      // Verify the reminder form/detail screen appears with the reminder
      await waitFor(element(by.id('reminder-detail')))
        .toBeVisible()
        .withTimeout(5000);
      await expect(element(by.text('Take medication'))).toBeVisible();
    });
  });

  describe('Logout', () => {
    it('logs out and returns to login screen', async () => {
      // Navigate back to dashboard if not there
      await element(by.text(/Reminders/i)).tap();

      // Tap logout button in header
      await element(by.id('header-logout')).tap();

      // Verify login screen is shown
      await waitFor(element(by.id('login-email')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});
