# Memento — Frontend Planning Docs

Planning and structure for the **Memento** reminder system frontend: a
cross-platform mobile app built with **React Native** that integrates with the
backend REST API (JWT auth) and **Firebase Cloud Messaging** (FCM) for push
notifications.

## Goals

1. User login screen (JWT authentication)
2. Dashboard listing reminders (pagination / pull-to-refresh)
3. Create / edit / delete reminder screens (CRUD)
4. Receive and display notifications for triggered reminders — foreground,
   background, and when the app is fully closed

## Architecture at a glance

```
┌──────────────────────────────────────────────────────────┐
│                     React Native App                       │
│                                                            │
│  ┌───────────┐   ┌──────────────┐   ┌──────────────────┐   │
│  │  Screens  │──▶│  Hooks / VM  │──▶│  Services layer  │   │
│  │ (UI only) │   │ (state, RQ)  │   │ (API, auth, FCM) │   │
│  └───────────┘   └──────────────┘   └────────┬─────────┘   │
│                                              │             │
│  ┌────────────────────────────────────────┐ │             │
│  │ Navigation (React Navigation)          │ │             │
│  └────────────────────────────────────────┘ │             │
└──────────────────────────────────────────────┼────────────┘
                                               │ HTTPS + JWT
                       ┌───────────────────────▼───────────┐
                       │            Backend API            │
                       │  /auth  /reminders  /devices      │
                       └───────────────────┬───────────────┘
                                           │ registers token
                                           ▼
                                ┌────────────────────┐
                                │  Firebase Cloud     │
                                │  Messaging (FCM)    │
                                └────────────────────┘
```

**Layering rule (SOLID / clean architecture):** Screens never call `fetch`
directly. UI → hooks → services → HTTP client. Each layer depends only on the
one below it, so any layer can be tested or swapped in isolation.

## Documents

| # | File | Topic |
|---|------|-------|
| 1 | [01-setup.md](./01-setup.md) | Project bootstrap, dependencies, folder structure |
| 2 | [02-login-screen.md](./02-login-screen.md) | Login UI, validation, JWT storage |
| 3 | [03-dashboard-screen.md](./03-dashboard-screen.md) | Reminder list, pagination, pull-to-refresh |
| 4 | [04-reminder-screens.md](./04-reminder-screens.md) | Create / edit / delete CRUD screens |
| 5 | [05-backend-integration.md](./05-backend-integration.md) | API client, auth flow, error handling |
| 6 | [06-firebase-setup.md](./06-firebase-setup.md) | FCM credentials and configuration |
| 7 | [07-notification-handling.md](./07-notification-handling.md) | Foreground/background/killed notifications, deep links |
| 8 | [08-unit-tests.md](./08-unit-tests.md) | Jest + React Native Testing Library |
| 9 | [09-e2e-tests.md](./09-e2e-tests.md) | Detox end-to-end tests |
| 10 | [10-error-handling.md](./10-error-handling.md) | Input & API error handling, network resilience |
| 11 | [11-performance-optimization.md](./11-performance-optimization.md) | Lazy loading, caching, bundle size |

## Conventions used across all docs

- **Language:** TypeScript (strict mode).
- **State/server cache:** [TanStack Query](https://tanstack.com/query) for
  server state, React Context (or Zustand) for lightweight client state.
- **Principles:** SOLID, DRY, KISS. Business logic lives in services and hooks;
  components stay presentational.
- **Assumed backend contract:** documented in
  [backend-integration.md](./backend-integration.md). Adjust endpoint names to
  your actual API.
