# 2. Login Screen

## Task

Implement the user login screen: email/password UI, client-side validation,
call the backend `POST /auth/login` endpoint, and securely persist the returned
JWT so the user stays authenticated across app restarts.

## Dependencies / libraries

- `react-hook-form` + `zod` — form state and validation.
- `axios` (via the shared API client) — network call.
- `react-native-keychain` — secure token storage.
- `@react-navigation/native-stack` — navigate to Dashboard on success.

## UI components

```
┌────────────────────────────┐
│          Memento           │  ← logo / title
│                            │
│  Email     [____________]  │  ← Input (keyboardType=email)
│  Password  [____________]  │  ← Input (secureTextEntry, show/hide)
│                            │
│  [ error message text ]    │  ← inline server/validation error
│                            │
│      [   Log in   ]        │  ← Button (loading spinner while pending)
└────────────────────────────┘
```

Reusable primitives from `src/components/`: `TextField`, `Button`,
`ScreenContainer`. Keep the screen presentational — logic lives in a hook.

## Validation

Shared schema (DRY — reused for typing and validation):

```ts
// src/features/auth/loginSchema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginForm = z.infer<typeof loginSchema>;
```

Wire with `react-hook-form`:

```tsx
const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
});
```

## Auth service & token storage

Token persistence is isolated so screens never touch storage directly:

```ts
// src/services/auth/tokenStore.ts
import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.memento.auth';

export const tokenStore = {
  async save(accessToken: string, refreshToken?: string) {
    await Keychain.setGenericPassword(
      'jwt',
      JSON.stringify({ accessToken, refreshToken }),
      { service: SERVICE },
    );
  },
  async get() {
    const creds = await Keychain.getGenericPassword({ service: SERVICE });
    return creds ? JSON.parse(creds.password) as
      { accessToken: string; refreshToken?: string } : null;
  },
  async clear() {
    await Keychain.resetGenericPassword({ service: SERVICE });
  },
};
```

```ts
// src/services/auth/authService.ts
import { apiClient } from '../api/client';
import { tokenStore } from './tokenStore';

export async function login(email: string, password: string) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  // data: { accessToken, refreshToken, user }
  await tokenStore.save(data.accessToken, data.refreshToken);
  return data.user;
}

export async function logout() {
  await tokenStore.clear();
}
```

## Auth context

A single source of truth for "is the user logged in", read by the navigator:

```tsx
// src/features/auth/AuthProvider.tsx (simplified)
const AuthContext = createContext<AuthState>(/* ... */);

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    // Silent re-auth on launch: if a token exists, treat as logged in.
    tokenStore.get().then(t => { if (t) setUser(/* decode or /auth/me */); })
      .finally(() => setBootstrapping(false));
  }, []);

  const signIn = async (email: string, password: string) =>
    setUser(await login(email, password));

  const signOut = async () => { await logout(); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, bootstrapping, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

`RootNavigator` renders `AuthStack` when `user === null`, otherwise `MainStack`.

## Screen hook (ties it together)

```tsx
function useLogin() {
  const { signIn } = useAuth();
  return useMutation({
    mutationFn: ({ email, password }: LoginForm) => signIn(email, password),
  });
}
```

The screen calls `mutate(values)` from `handleSubmit`, shows the spinner while
`isPending`, and renders `error.message` inline (mapped by the API error
handler — see [10-error-handling.md](./10-error-handling.md)).

## Security notes

- **Never** store JWTs in `AsyncStorage` (plaintext). Use Keychain/Keystore.
- After registering the FCM device token
  (see [07-notification-handling.md](./07-notification-handling.md)), post it to the
  backend once login succeeds so this device can receive pushes.
- On `401` from any request, clear the token and route back to Login (handled
  by the axios response interceptor — see
  [05-backend-integration.md](./05-backend-integration.md)).

## Definition of done

- Invalid input shows inline errors before any network call.
- Successful login stores the JWT in Keychain and navigates to Dashboard.
- Wrong credentials show a friendly server error.
- Relaunching the app while a valid token exists skips the login screen.
