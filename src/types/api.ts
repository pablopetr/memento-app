/** Normalized error surfaced by the API layer to hooks/UI. */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
}
