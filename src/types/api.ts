/** Categorized error from the API layer, used by hooks/UI to decide retry/retry policy. */
export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'validation'
  | 'server'
  | 'unknown';

/**
 * Normalized error surfaced by the API layer to hooks/UI. The single source of
 * truth for error shape so components never inspect raw axios internals (DRY).
 */
export interface ApiError extends Error {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  /** Server-side validation errors mapped by field name (used in forms). */
  fieldErrors?: Record<string, string>;
}
