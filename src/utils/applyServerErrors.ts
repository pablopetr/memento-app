import {UseFormSetError} from 'react-hook-form';

import {ApiError} from '../types/api';

/**
 * Maps a 422 validation response's fieldErrors back to react-hook-form so the
 * errors render inline on the correct fields. Call this in a mutation's
 * onError handler.
 *
 * Note: Field names from the server are dynamic, so we must use `as any` to
 * satisfy react-hook-form's strict FieldPath typing. The server's field names
 * should match the form schema to appear on the correct fields.
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
      // Field names are dynamic from server; cast is necessary for form binding.
      setError(field as any, {type: 'server', message});
    });
  }
}
