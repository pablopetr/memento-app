import notifee, {AndroidImportance} from '@notifee/react-native';

/**
 * Wraps notifee for displaying local notifications and managing channels.
 * Handles both generic notifications and reminder notifications (FCM data).
 */
export const DEFAULT_CHANNEL_ID = 'reminders';

export async function ensureDefaultChannel(): Promise<string> {
  return notifee.createChannel({
    id: DEFAULT_CHANNEL_ID,
    name: 'Reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}

/** Generic notification display (for testing). */
export async function displayNotification(
  title: string,
  body?: string,
): Promise<void> {
  await ensureDefaultChannel();
  await notifee.displayNotification({
    title,
    body,
    android: {channelId: DEFAULT_CHANNEL_ID, pressAction: {id: 'default'}},
  });
}

/**
 * Display a reminder notification from FCM data. Includes the reminderId so
 * tapping the notification can deep-link to the reminder. Called from foreground,
 * background, and killed state handlers.
 */
export async function displayReminderNotification(
  data?: Record<string, any>,
): Promise<void> {
  await ensureDefaultChannel();
  await notifee.displayNotification({
    title: data?.title ?? 'Reminder',
    body: data?.body ?? '',
    data: {reminderId: data?.reminderId ?? ''},
    android: {channelId: DEFAULT_CHANNEL_ID, pressAction: {id: 'default'}},
    ios: {sound: 'default'},
  });
}
