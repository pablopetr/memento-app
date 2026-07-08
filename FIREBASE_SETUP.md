# Firebase Setup Checklist

This document guides you through the manual Firebase configuration steps required before push notifications work. See [`docs/06-firebase-setup.md`](./docs/06-firebase-setup.md) for the full technical details.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** and complete the setup wizard
3. Once created, register two apps:
   - **Android app** — note the application ID (e.g., `com.memento.app`)
   - **iOS app** — note the bundle ID (e.g., `com.memento.app`)

## 2. Android Setup

### A. Download and place credentials

1. In Firebase Console → Your Android app → download `google-services.json`
2. Place the file in `android/app/` (not git-tracked by default; add to `.gitignore`)

### B. Update Android build files

In `android/build.gradle` (project level), add to dependencies:

```gradle
dependencies {
  classpath 'com.google.gms:google-services:4.4.2'
}
```

In `android/app/build.gradle`, apply the plugin at the top:

```gradle
apply plugin: 'com.google.gms.google-services'
```

### C. Verify AndroidManifest.xml

Confirm that `android/app/src/main/AndroidManifest.xml` has the notification permission:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

✅ Already added by the scaffold.

## 3. iOS Setup

### A. Download and add credentials to Xcode

1. In Firebase Console → Your iOS app → download `GoogleService-Info.plist`
2. Open Xcode → Open `ios/Memento.xcworkspace` (not `ios/Memento.xcodeproj`)
3. Drag `GoogleService-Info.plist` into Xcode (select "Copy items if needed", add to target)

### B. Configure signing capabilities

In Xcode:

1. Select the **Memento** project (left sidebar)
2. Select the **Memento** target
3. Go to **Signing & Capabilities**
4. Click **+ Capability** and add:
   - **Push Notifications**
   - **Background Modes** → enable **Remote notifications**

### C. Install pods

From the terminal:

```bash
cd ios && pod install && cd ..
```

### D. Set up Apple Push Notification service (APNs)

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. In **Certificates, Identifiers & Profiles**, create an **APNs Authentication Key** (.p8 file)
3. In Firebase Console → **Project Settings → Cloud Messaging → Apple app configuration**
4. Upload the .p8 file and record the Key ID and Team ID

## 4. Verify Installation

### A. Check build succeeds

```bash
# Android
npm run android

# iOS
npm run ios
```

### B. Request FCM token at runtime

The app will request a device FCM token on first launch (handled in task 07). You should see it in the console logs.

### C. Send a test push

In Firebase Console → **Cloud Messaging** (or **Messaging**) → **Send your first message**:

1. Enter a title and body
2. Under **Target**, select **Single device**
3. Paste the FCM token from step B
4. Click **Send**

You should see the notification appear on the device.

## 5. Backend Integration

Your backend needs the **Server Key** or **Service Account** JSON to send pushes:

- **Legacy key**: Firebase Console → **Project Settings → Cloud Messaging** (Server Key)
- **HTTP v1 API**: Firebase Console → **Project Settings** → Service Accounts → Generate new private key

Store this securely in your backend deployment (environment variables, secrets manager) — **never bundle in the app**.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| App crashes on launch with Firebase config error | Verify `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is present and correctly placed |
| FCM token is null | Check permissions (Android 13+) are granted at runtime; ensure Firebase is initialized |
| Test push doesn't arrive | Verify the app is running with the correct FCM token; check the backend is using the correct server key |
| Push received but notification doesn't show | Ensure notification permission is requested at runtime (iOS) or auto-granted (Android < 13) |

## Next steps

Once Firebase is configured and the app builds successfully, move on to [`docs/07-notification-handling.md`](./docs/07-notification-handling.md) to wire up the runtime push-handling logic.
