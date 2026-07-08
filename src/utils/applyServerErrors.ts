import {UseFormSetError} from 'react-hook-form';

import {ApiError} from '../types/api';

/**
 * Maps a 422 validation response's fieldErrors back to react-hook-form so the
 * errors render inline on the correct fields. Call this in a mutation's
 * onError handler.
 *
 * Example:
 *   useCreateReminder().mutate(values, {
 *     onError: (err) => {
 *       applyServerErrors(err, setError);
 *       if (err.kind !== 'validation') toast.error(err.message);
 *     },
 *   });
 */
export function applyServerErrors(
  error: ApiError,
  setError: UseFormSetError<any>,
): void {
  if (error.kind === 'validation' && error.fieldErrors) {
    Object.entries(error.fieldErrors).forEach(([field, message]) => {
      setError(field as any, {type: 'server', message});
    });
  }
}
