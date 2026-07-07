# 7. Notification Handling

## Task

Handle FCM notifications across all app states — **foreground**, **background**,
and **killed** — display them appropriately, and deep-link the user to the
relevant reminder when a notification is tapped. Also manage the device token
lifecycle (register, refresh, permission).

## Dependencies / libraries

- `@react-native-firebase/messaging` — FCM listeners & token.
- `@notifee/react-native` — display + tap handling of local notifications.
- `@react-navigation/native` — deep-link navigation to a reminder.

## App states & who displays the notification

| App state | Notification message | Data-only message |
|-----------|----------------------|-------------------|
| **Foreground** | *Not* shown by OS → we display with Notifee | `onMessage` fires → display with Notifee |
| **Background** | OS shows it in the tray automatically | `setBackgroundMessageHandler` fires → display with Notifee |
| **Killed** | OS shows it in the tray automatically | Background handler fires (headless) → display with Notifee |

**Design choice:** backend sends **data messages** so we control rendering
consistently in every state (see [06-firebase-setup.md](./06-firebase-setup.md)).

## 1. Permission + token registration

Run after login (so we can associate the token with the user):

```ts
// src/services/notifications/fcmService.ts
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { registerDevice } from '../api/deviceService';

export async function initPushForUser() {
  const status = await messaging().requestPermission(); // iOS + Android 13+
  const granted =
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL;
  if (!granted) return;

  const token = await messaging().getToken();
  await registerDevice(token, Platform.OS as 'ios' | 'android');
}

// Keep backend in sync when FCM rotates the token.
export function subscribeTokenRefresh() {
  return messaging().onTokenRefresh((token) =>
    registerDevice(token, Platform.OS as 'ios' | 'android'),
  );
}
```

## 2. Background / killed handler (register at module top level)

Must be registered **outside** any component, in `index.js`, so it runs in the
headless JS context when the app is not in the foreground:

```ts
// index.js (top level, before AppRegistry.registerComponent)
import messaging from '@react-native-firebase/messaging';
import { displayReminderNotification } from './src/services/notifications/notificationService';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  await displayReminderNotification(remoteMessage.data);
});
```

## 3. Foreground handler (in a hook, mounted once)

```ts
// src/features/notifications/useNotifications.ts
export function useNotifications() {
  useEffect(() => {
    ensureChannel();
    const unsubMsg = messaging().onMessage(async (msg) => {
      await displayReminderNotification(msg.data); // OS won't show fg messages
    });
    const unsubRefresh = subscribeTokenRefresh();
    return () => { unsubMsg(); unsubRefresh(); };
  }, []);
}
```

## 4. Display with Notifee

```ts
// src/services/notifications/notificationService.ts
import notifee from '@notifee/react-native';
import { REMINDER_CHANNEL_ID, ensureChannel } from './channel';

export async function displayReminderNotification(data?: Record<string, any>) {
  await ensureChannel();
  await notifee.displayNotification({
    title: data?.title ?? 'Reminder',
    body: data?.body ?? '',
    data: { reminderId: data?.reminderId ?? '' }, // carried to tap handler
    android: { channelId: REMINDER_CHANNEL_ID, pressAction: { id: 'default' } },
    ios: { sound: 'default' },
  });
}
```

## 5. Handling taps → deep link to the reminder

Two paths: the notification that **opened** the app from a killed state, and
taps while running.

```ts
// src/features/notifications/useNotificationNavigation.ts
export function useNotificationNavigation() {
  const navigation = useNavigation();

  const openReminder = useCallback((reminderId?: string) => {
    if (reminderId) navigation.navigate('EditReminder', { reminderId });
  }, [navigation]);

  useEffect(() => {
    // App opened from KILLED state by tapping a notification.
    notifee.getInitialNotification().then(initial => {
      openReminder(initial?.notification?.data?.reminderId as string);
    });
    messaging().getInitialNotification().then(msg => {
      openReminder(msg?.data?.reminderId as string);
    });

    // Tap while app is in BACKGROUND/FOREGROUND (Notifee-rendered).
    const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) openReminder(detail.notification?.data?.reminderId as string);
    });

    // FCM notification-message tap that brought app from background→foreground.
    const unsubOpened = messaging().onNotificationOpenedApp(msg =>
      openReminder(msg?.data?.reminderId as string),
    );

    return () => { unsubNotifee(); unsubOpened(); };
  }, [openReminder]);
}
```

> Also register `notifee.onBackgroundEvent(...)` in `index.js` to handle taps on
> Notifee-rendered notifications while the app is in the background.

## 6. Deep-link config (React Navigation)

Define `linking` on `NavigationContainer` so `EditReminder` is reachable and the
navigator waits for navigation to be ready before consuming the initial
notification.

## Sequence: a reminder fires while the app is closed

```
Backend scheduler ──(reminder due)──▶ FCM ──▶ Device (app killed)
        │                                          │
        │                          setBackgroundMessageHandler runs (headless)
        │                                          │
        │                             Notifee displays tray notification
        │                                          │
        │                              user taps ──▶ app launches
        │                                          │
        │           getInitialNotification() → navigate('EditReminder', {id})
```

## Definition of done

- Notifications appear in foreground, background, and killed states.
- Tapping a notification opens the correct reminder in every state.
- Device token is registered on login and re-registered on refresh.
- Permission is requested; denial degrades gracefully (no crash).
