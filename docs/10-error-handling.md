# 10. Error Handling & Validation

## Task

Provide consistent, user-friendly error handling across the app: validate user
input before submission, translate API/network failures into clear messages,
recover gracefully from lost connectivity, and never crash the UI. Builds on the
typed `ApiError` from [05-backend-integration.md](./05-backend-integration.md).

## Dependencies / libraries

- `zod` + `react-hook-form` — input validation.
- `@tanstack/react-query` — mutation/query error states + retry.
- `@react-native-community/netinfo` — connectivity awareness.
- A toast/snackbar lib (e.g. `react-native-toast-message`) — transient errors.

## Layers of error handling

```
User input ─▶ zod validation ─▶ [blocks submit, inline field errors]
                                        │ valid
Service call ─▶ axios interceptor ─▶ toApiError() ─▶ typed ApiError
                                                          │
        ┌─────────────────────────────────────────────────┤
        ▼                    ▼                    ▼         ▼
   field errors        screen ErrorState     toast/snackbar  session expiry
   (form)              (retry)               (bg mutation)   (→ login)
```

## 1. Input validation (client-side, pre-network)

Zod schemas (shared with types) gate every form. Errors render inline next to
each field; submit is disabled until valid. See
[02-login-screen.md](./02-login-screen.md) and
[04-reminder-screens.md](./04-reminder-screens.md).

## 2. Mapping server field errors back to the form

When the API returns `422` with `fieldErrors`, surface them on the exact fields:

```ts
function applyServerErrors(err: ApiError, setError: UseFormSetError<any>) {
  if (err.kind === 'validation' && err.fieldErrors) {
    Object.entries(err.fieldErrors).forEach(([field, message]) =>
      setError(field as any, { type: 'server', message }));
  }
}

// in a mutation:
useCreateReminder().mutate(values, {
  onError: (err: ApiError) => {
    applyServerErrors(err, setError);
    if (err.kind !== 'validation') toast.error(err.message);
  },
});
```

## 3. Reusable UI states

Keep error UX DRY with shared components:

```tsx
// ErrorState — full-screen (queries)
<ErrorState message={error.message} onRetry={refetch} />

// InlineError — under a form field
{error && <InlineError message={error} />}

// toast — transient background failures
toast.error('Could not delete reminder. Please try again.');
```

Decision guide:

| Situation | Pattern |
|-----------|---------|
| A screen's primary data failed to load | Full-screen `ErrorState` + retry |
| A form submission failed validation | Inline field errors |
| A background/optimistic mutation failed | Toast + rollback |
| Session expired (401 after refresh) | Redirect to Login + toast |

## 4. Network / connectivity handling

```ts
// src/hooks/useOnlineStatus.ts
export function useOnlineStatus() {
  const [online, setOnline] = useState(true);
  useEffect(() =>
    NetInfo.addEventListener(s => setOnline(Boolean(s.isConnected))), []);
  return online;
}
```

- Show a persistent "You're offline" banner when disconnected.
- React Query automatically pauses and refetches on reconnect
  (`onlineManager`). Configure `retry` for `network`/`timeout` kinds only (see
  [05-backend-integration.md](./05-backend-integration.md)).
- Disable submit buttons while offline for mutations that require the network.

## 5. Global crash safety

Wrap the app (and heavy screens) in an **Error Boundary** so a render error
shows a fallback instead of a white screen:

```tsx
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { logToCrashReporter(error, info); }
  render() {
    return this.state.hasError
      ? <FallbackScreen onReset={() => this.setState({ hasError: false })} />
      : this.props.children;
  }
}
```

Report caught errors to a crash service (Sentry / Firebase Crashlytics).

## 6. Message guidelines

- Never surface raw stack traces, status codes, or backend jargon to users.
- Be specific and actionable: *"Reminder time must be in the future"* beats
  *"Validation failed"*.
- Offer a next step: **Retry**, **Go back**, or **Log in again**.

## Definition of done

- Invalid input is blocked with clear inline messages before any request.
- Every failure kind (network, timeout, 401, 422, 5xx) maps to an appropriate,
  non-technical UI response.
- Offline is detected and communicated; the app recovers on reconnect.
- A render-time crash shows a recoverable fallback, not a blank screen.
