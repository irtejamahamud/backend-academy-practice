import type { ApiErrorBody, ErrorCode, FieldError } from '@academy/shared';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
    readonly details: FieldError[] = [],
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Field errors keyed by path, for rendering next to inputs. */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const d of this.details) out[d.path] ??= d.message;
    return out;
  }

  static async from(res: Response): Promise<ApiError> {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    if (body?.error) {
      return new ApiError(res.status, body.error.code, body.error.message, body.error.details, body.error.requestId);
    }
    return new ApiError(res.status, res.status >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST', 'Something went wrong. Please try again.');
  }
}

export const NETWORK_ERROR = new ApiError(0, 'INTERNAL_ERROR', 'Could not reach the server. Check your connection and try again.');
