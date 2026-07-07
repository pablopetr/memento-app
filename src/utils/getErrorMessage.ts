import axios from 'axios';

/**
 * Maps an unknown thrown value to a user-friendly message. The full API error
 * normalization (status codes, 401 handling) is built in
 * docs/05-backend-integration.md / docs/10-error-handling.md; this keeps the
 * login screen readable until then.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const data = error.response.data as {message?: string} | undefined;
      if (data?.message) {
        return data.message;
      }
      if (error.response.status === 401) {
        return 'Incorrect email or password.';
      }
      return 'Something went wrong. Please try again.';
    }
    return 'Network error. Check your connection and try again.';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
