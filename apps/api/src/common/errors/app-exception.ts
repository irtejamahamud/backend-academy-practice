import { HttpStatus } from '@nestjs/common';
import type { ErrorCode, FieldError } from '@academy/shared';

const STATUS_BY_CODE: Record<ErrorCode, HttpStatus> = {
  BAD_REQUEST: HttpStatus.BAD_REQUEST,
  VALIDATION_FAILED: HttpStatus.UNPROCESSABLE_ENTITY,
  UNAUTHENTICATED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  CONFLICT: HttpStatus.CONFLICT,
  RATE_LIMITED: HttpStatus.TOO_MANY_REQUESTS,
  EMAIL_NOT_VERIFIED: HttpStatus.FORBIDDEN,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  INVALID_TOKEN: HttpStatus.BAD_REQUEST,
  INTERNAL_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
};

/** The single exception type services throw. The global filter maps it to the error envelope. */
export class AppException extends Error {
  readonly status: HttpStatus;

  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: FieldError[],
  ) {
    super(message);
    this.name = 'AppException';
    this.status = STATUS_BY_CODE[code];
  }
}
