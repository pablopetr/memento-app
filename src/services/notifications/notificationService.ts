import notifee, {AndroidImportance} from '@notifee/react-native';

/**
 * Wraps notifee for displaying local notifications and managing channels.
 * Fully implemented in docs/07-notification-handling.md; here we establish
 * the default Android channel the rest of the app relies on.
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
