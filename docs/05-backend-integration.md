# 5. Backend Integration

## Task

Build the networking layer: a single configured `axios` client that attaches the
JWT to every request, refreshes/expires tokens, normalizes errors, and exposes
typed service functions consumed by hooks. This is the boundary between the app
and the backend.

## Dependencies / libraries

- `axios` — HTTP client with interceptors.
- `react-native-keychain` — read the stored JWT (via `tokenStore`).
- `@tanstack/react-query` — consumes the services; handles retries/caching.

## Assumed API contract

> Adjust to your real backend. Documented here so all screens share one source
> of truth.

| Method | Path | Body / Params | Returns |
|--------|------|---------------|---------|
| `POST` | `/auth/login` | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| `POST` | `/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| `GET` | `/auth/me` | – | `User` |
| `GET` | `/reminders` | `?cursor&limit` | `{ items: Reminder[], nextCursor }` |
| `GET` | `/reminders/:id` | – | `Reminder` |
| `POST` | `/reminders` | `ReminderInput` | `Reminder` |
| `PUT` | `/reminders/:id` | `ReminderInput` | `Reminder` |
| `DELETE` | `/reminders/:id` | – | `204` |
| `POST` | `/devices` | `{ fcmToken, platform }` | `204` |

All protected endpoints expect `Authorization: Bearer <accessToken>`.

## API client with interceptors

```ts
// src/services/api/client.ts
import axios from 'axios';
import { env } from '../../config/env';
import { tokenStore } from '../auth/tokenStore';
import { toApiError } from './errors';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request: attach JWT.
apiClient.interceptors.request.use(async (config) => {
  const tokens = await tokenStore.get();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Response: refresh on 401 once, else normalize error.
let refreshing: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      refreshing ??= refreshAccessToken();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
      await onSessionExpired();      // clear token + route to Login
    }
    return Promise.reject(toApiError(error));
  },
);
```

`refreshAccessToken()` calls `/auth/refresh`, saves the new pair, and returns the
new access token (or `null` on failure). A shared in-flight `refreshing` promise
prevents a refresh stampede when several requests 401 at once.

## Normalized error type

A single shape so the UI never inspects raw axios internals (DRY):

```ts
// src/services/api/errors.ts
export type ApiError = {
  kind: 'network' | 'timeout' | 'unauthorized' | 'validation' | 'server' | 'unknown';
  message: string;        // user-safe message
  status?: number;
  fieldErrors?: Record<string, string>;
};

export function toApiError(error: any): ApiError {
  if (error.code === 'ECONNABORTED')
    return { kind: 'timeout', message: 'The request timed out. Try again.' };
  if (!error.response)
    return { kind: 'network', message: 'No connection. Check your network.' };

  const { status, data } = error.response;
  switch (status) {
    case 401: return { kind: 'unauthorized', status, message: 'Session expired. Please log in again.' };
    case 422:
    case 400: return { kind: 'validation', status, message: data?.message ?? 'Invalid input.', fieldErrors: data?.errors };
    default:  return status >= 500
      ? { kind: 'server', status, message: 'Something went wrong on our end.' }
      : { kind: 'unknown', status, message: data?.message ?? 'Unexpected error.' };
  }
}
```

## Consuming in React Query

Because services throw `ApiError`, components read `error.message` directly.
Configure global retry policy so transient failures self-heal but auth/validation
errors do not retry:

```ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, err: any) =>
        err?.kind === 'network' || err?.kind === 'timeout' ? count < 2 : false,
      staleTime: 30_000,
    },
  },
});
```

## Device registration

After login and after obtaining the FCM token, register the device so the
backend can target pushes:

```ts
export const registerDevice = (fcmToken: string, platform: 'ios' | 'android') =>
  apiClient.post('/devices', { fcmToken, platform });
```

See [07-notification-handling.md](./07-notification-handling.md) for when this
runs and how token refresh is handled.

## Error surfacing to the user

- Field-level: map `fieldErrors` back onto the form (see
  [10-error-handling.md](./10-error-handling.md)).
- Screen-level: `ErrorState` component with retry.
- Transient/global: toast/snackbar for background mutations.

## Definition of done

- Every protected request carries a valid `Authorization` header.
- A single 401 transparently refreshes and retries once; repeated failure logs
  the user out cleanly.
- All service errors reach the UI as a typed `ApiError` with a user-safe message.
