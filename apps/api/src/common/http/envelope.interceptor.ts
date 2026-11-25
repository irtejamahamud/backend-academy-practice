import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor } from '@nestjs/common';
import type { ApiSuccess } from '@academy/shared';
import { map, type Observable } from 'rxjs';

/** Wraps successful handler results in `{ data }`. Handlers returning `undefined` produce 204-style empty bodies. */
@Injectable()
export class EnvelopeInterceptor<T> implements NestInterceptor<T, ApiSuccess<T> | undefined> {
  intercept(_ctx: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccess<T> | undefined> {
    return next.handle().pipe(map((data) => (data === undefined ? undefined : { data })));
  }
}
