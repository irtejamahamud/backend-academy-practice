import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import type { ApiErrorBody, ErrorCode } from '@academy/shared';
import type { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';
import { AppException } from './app-exception.js';

const CODE_BY_STATUS: Partial<Record<number, ErrorCode>> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_FAILED',
  429: 'RATE_LIMITED',
};

/** Converts every thrown value into the standard `{ error }` envelope. Never leaks internals. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const requestId = typeof req.id === 'string' ? req.id : undefined;

    const { status, body } = this.toResponse(exception);
    body.error.requestId = requestId;

    if (status >= 500) {
      this.logger.error({ err: exception, requestId }, 'Unhandled error');
    }
    res.status(status).json(body);
  }

  private toResponse(exception: unknown): { status: number; body: ApiErrorBody } {
    if (exception instanceof AppException) {
      return {
        status: exception.status,
        body: { error: { code: exception.code, message: exception.message, details: exception.details } },
      };
    }
    if (exception instanceof ThrottlerException) {
      return {
        status: HttpStatus.TOO_MANY_REQUESTS,
        body: { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' } },
      };
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const code = CODE_BY_STATUS[status] ?? (status >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST');
      const message = status >= 500 ? 'Internal server error' : exception.message;
      return { status, body: { error: { code, message } } };
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return { status: 409, body: { error: { code: 'CONFLICT', message: 'Resource already exists' } } };
      }
      if (exception.code === 'P2025') {
        return { status: 404, body: { error: { code: 'NOT_FOUND', message: 'Resource not found' } } };
      }
    }
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
    };
  }
}
