/** Every API response uses one of these two envelopes. */
export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export const ERROR_CODES = [
  'BAD_REQUEST',
  'VALIDATION_FAILED',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'EMAIL_NOT_VERIFIED',
  'INVALID_CREDENTIALS',
  'INVALID_TOKEN',
  'INTERNAL_ERROR',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export interface FieldError {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    requestId?: string;
    details?: FieldError[];
  };
}
