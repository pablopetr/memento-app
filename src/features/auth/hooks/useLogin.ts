import {useMutation} from '@tanstack/react-query';

import {useAuth} from '../AuthContext';
import {LoginForm} from '../loginSchema';

/**
 * Ties the form to the auth context. On success the context sets `user`, which
 * flips RootNavigator from the AuthStack to the MainStack — so the screen never
 * navigates imperatively. Exposes `isPending`/`error` for the UI.
 */
export function useLogin() {
  const {signIn} = useAuth();

  return useMutation({
    mutationFn: (values: LoginForm) => signIn(values),
  });
}
