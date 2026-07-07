# 6. Firebase Cloud Messaging Setup

## Task

Set up Firebase and configure the React Native app to receive push
notifications via Firebase Cloud Messaging (FCM), on both Android and iOS. This
doc covers credentials and native configuration; runtime handling is in
[07-notification-handling.md](./07-notification-handling.md).

## Dependencies / libraries

- `@react-native-firebase/app` — Firebase core.
- `@react-native-firebase/messaging` — FCM client.
- `@notifee/react-native` — display local notifications & manage channels.

## 1. Create the Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/) → **Add
   project**.
2. Register two apps under the project:
   - **Android** app — application id must match `android/app/build.gradle`
     `applicationId` (e.g. `com.memento.app`).
   - **iOS** app — bundle id must match Xcode (e.g. `com.memento.app`).

## 2. Android configuration

1. Download `google-services.json` and place it in `android/app/`.
2. In `android/build.gradle` (project level), add the plugin classpath:

   ```gradle
   buildscript {
     dependencies {
       classpath 'com.google.gms:google-services:4.4.2'
     }
   }
   ```

3. In `android/app/build.gradle`, apply the plugin at the top:

   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

4. Android 13+ requires the runtime notification permission — declared in
   `AndroidManifest.xml` and requested at runtime (see
   [07-notification-handling.md](./07-notification-handling.md)):

   ```xml
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   ```

## 3. iOS configuration

1. Download `GoogleService-Info.plist` and add it to the Xcode project (drag
   into the project root, "Copy items if needed", add to target).
2. **Apple Push Notification service (APNs):** FCM delivers to iOS through APNs.
   In the [Apple Developer portal](https://developer.apple.com/) create an
   **APNs Authentication Key (.p8)** and upload it in Firebase Console →
   **Project settings → Cloud Messaging → Apple app configuration**. Record the
   Key ID and Team ID.
3. In Xcode → **Signing & Capabilities**, add:
   - **Push Notifications**
   - **Background Modes** → check **Remote notifications** (required so the OS
     wakes the app for background/killed data messages).
4. Run `cd ios && pod install`.

## 4. Verify credentials

- The **Server key / service account** used by the backend to *send* pushes
  lives in Firebase Console → **Project settings → Cloud Messaging** (legacy
  server key) or a **service-account JSON** for the HTTP v1 API. This is a
  **backend** secret — never bundle it in the app.
- The app only needs the config files above; it obtains a per-device **FCM
  registration token** at runtime.

## 5. Message types (design decision)

| Type | Delivered when app is | Wakes app? | Use for |
|------|----------------------|------------|---------|
| **Notification message** | fg / bg / killed | OS shows tray notification automatically | Simple reminder alert |
| **Data message** | fg / bg / killed | App code decides (background handler) | Custom display via Notifee, deep-link payload |

**Recommendation:** the backend sends a **data-only message** (or notification +
data) carrying `{ reminderId, title, body }` so the app can render a rich
notification with Notifee and deep-link on tap. See
[07-notification-handling.md](./07-notification-handling.md).

## 6. Notification channel (Android)

Android requires a channel before showing notifications:

```ts
// src/services/notifications/notificationService.ts
import notifee, { AndroidImportance } from '@notifee/react-native';

export const REMINDER_CHANNEL_ID = 'reminders';

export async function ensureChannel() {
  await notifee.createChannel({
    id: REMINDER_CHANNEL_ID,
    name: 'Reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}
```

## Security notes

- Commit `google-services.json` / `GoogleService-Info.plist` only if your repo
  is private; otherwise inject them in CI. They are not highly sensitive but
  identify your project.
- The FCM **send** credential is backend-only. The app never sends pushes
  directly.

## Definition of done

- App builds on Android and iOS with Firebase initialized (no missing-config
  crash on launch).
- Requesting a device token returns a non-null FCM token on a real device.
- A test push from the Firebase Console reaches the device.
