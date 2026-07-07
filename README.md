# Memento

Cross-platform (React Native + TypeScript) reminder app. Users log in with JWT,
manage reminders (CRUD), and receive push notifications via Firebase Cloud
Messaging — in the foreground, background, and when the app is killed.

Planning and step-by-step build docs live in [`docs/`](./docs/README.md).

## Requirements

- Node >= 18
- JDK 17 + Android SDK (Android), Xcode + CocoaPods (iOS)
- A bare React Native environment (Expo Go will not work — FCM needs native modules)

## Getting started

```bash
npm install
cp .env.example .env        # set API_URL
cd ios && pod install && cd ..   # iOS only

npm start                   # Metro bundler
npm run android             # or: npm run ios
```

## Scripts

| Script | What it does |
|--------|--------------|
| `npm start` | Start the Metro bundler |
| `npm run android` / `npm run ios` | Build and launch on a device/emulator |
| `npm test` | Run Jest unit tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Architecture

Layered, one-way dependencies (SOLID): **screens → hooks → services → HTTP client**.
Screens never call `fetch`/`axios` directly.

```
src/
├── app/            # App.tsx (providers), navigation, query client
├── config/         # typed env wrapper
├── services/       # framework-free logic: api, auth, reminders, notifications
├── features/       # UI grouped by domain (auth, reminders)
├── components/     # shared UI primitives
├── hooks/          # cross-cutting hooks
├── types/          # shared domain types
└── utils/          # formatters, guards
```

Server state is cached with TanStack Query; session/client state lives in a
small React context. See [`docs/01-setup.md`](./docs/01-setup.md) for the full
rationale.
