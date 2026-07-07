# 1. Project Setup

## Task

Bootstrap a new React Native (TypeScript) project for the Memento reminder app,
install and configure the core dependencies (navigation, HTTP client, secure
storage, Firebase messaging, server-state caching), and establish a clean,
layered folder structure that the rest of the docs build on.

## Dependencies / libraries

| Concern | Library | Why |
|---------|---------|-----|
| App framework | `react-native` (0.74+) via **React Native CLI** | FCM background/killed delivery needs native modules; the bare CLI (or an Expo *dev build*) is required — Expo Go will not work. |
| Navigation | `@react-navigation/native`, `@react-navigation/native-stack` | De-facto standard, deep-link support for notification taps. |
| Nav peer deps | `react-native-screens`, `react-native-safe-area-context` | Required by React Navigation. |
| HTTP client | `axios` | Interceptors for JWT + centralized error handling. |
| Server state | `@tanstack/react-query` | Caching, pagination, pull-to-refresh, retries out of the box. |
| Secure token storage | `react-native-keychain` | Stores JWT in Keychain/Keystore, not plain `AsyncStorage`. |
| Local persistence | `@react-native-async-storage/async-storage` | Non-sensitive cache (query persistence, prefs). |
| Push | `@react-native-firebase/app`, `@react-native-firebase/messaging` | FCM integration. |
| Local notification display | `notifee` (`@notifee/react-native`) | Rich foreground notifications & channels. |
| Forms & validation | `react-hook-form`, `zod`, `@hookform/resolvers` | Declarative validation, DRY schemas shared UI↔API. |
| Env config | `react-native-config` | `API_URL`, build-time secrets. |
| Dates | `date-fns` | Lightweight date formatting for reminder times. |

## High-level plan

### 1. Create the project

```bash
npx @react-native-community/cli@latest init MementoApp --template react-native-template-typescript
cd MementoApp
```

### 2. Install dependencies

```bash
# Navigation
npm i @react-navigation/native @react-navigation/native-stack \
      react-native-screens react-native-safe-area-context

# Data / networking / state
npm i axios @tanstack/react-query react-native-keychain \
      @react-native-async-storage/async-storage

# Firebase + notifications
npm i @react-native-firebase/app @react-native-firebase/messaging @notifee/react-native

# Forms / validation / config / dates
npm i react-hook-form zod @hookform/resolvers react-native-config date-fns
```

Then install pods for iOS:

```bash
cd ios && pod install && cd ..
```

### 3. Recommended folder structure

```
src/
├── app/
│   ├── App.tsx                 # Providers: QueryClient, Auth, Navigation
│   └── navigation/
│       ├── RootNavigator.tsx   # switches Auth vs Main stack
│       ├── AuthStack.tsx       # Login
│       └── MainStack.tsx       # Dashboard, Reminder screens
├── config/
│   └── env.ts                  # typed wrapper over react-native-config
├── services/                   # No React here — pure logic (testable)
│   ├── api/
│   │   ├── client.ts           # axios instance + interceptors
│   │   └── endpoints.ts        # path constants
│   ├── auth/
│   │   ├── authService.ts      # login/logout, token lifecycle
│   │   └── tokenStore.ts       # keychain read/write
│   ├── reminders/
│   │   └── reminderService.ts  # CRUD calls
│   └── notifications/
│       ├── fcmService.ts       # register token, listeners
│       └── notificationService.ts # notifee display/channels
├── features/
│   ├── auth/{screens,components,hooks}
│   ├── reminders/{screens,components,hooks}
│   └── ...
├── components/                 # shared UI primitives (Button, Input, ...)
├── hooks/                      # cross-cutting hooks
├── types/                      # shared TS types (Reminder, User, ...)
└── utils/                      # formatters, guards
```

**Why this layout (SOLID):** `services/` contains framework-free logic that is
trivial to unit test and can be reused; `features/` groups UI by domain;
shared `components/` keep the DRY primitives. Screens depend on hooks; hooks
depend on services; services depend on the api client.

### 4. Providers wiring

`src/app/App.tsx` composes the providers once (single responsibility per
provider):

```tsx
export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer linking={linking}>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
```

### 5. Environment config

`.env` (never committed — commit `.env.example`):

```
API_URL=https://api.memento.example.com
```

`src/config/env.ts`:

```ts
import Config from 'react-native-config';

export const env = {
  apiUrl: Config.API_URL ?? '',
} as const;
```

### 6. Native prerequisites

- **Android:** JDK 17, Android SDK, `google-services.json` in
  `android/app/` (see [06-firebase-setup.md](./06-firebase-setup.md)).
- **iOS:** Xcode, CocoaPods, `GoogleService-Info.plist`, Push Notifications +
  Background Modes (Remote notifications) capabilities.

## Definition of done

- `npm run android` and `npm run ios` launch a blank navigable app.
- Providers mounted, folder structure created, env config resolves `API_URL`.
- Lint (`eslint`) and typecheck (`tsc --noEmit`) pass in CI.
