/** Shape of a paginated list response from the backend. */
export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

/** Normalized error surfaced by the API layer to hooks/UI. */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
}
