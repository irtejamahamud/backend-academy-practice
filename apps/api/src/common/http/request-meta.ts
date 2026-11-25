import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export interface RequestMeta {
  ipAddress: string | null;
  userAgent: string | null;
}

export const ReqMeta = createParamDecorator((_: unknown, ctx: ExecutionContext): RequestMeta => {
  const req = ctx.switchToHttp().getRequest<Request>();
  const ua = req.headers['user-agent'];
  return {
    ipAddress: req.ip?.slice(0, 64) ?? null,
    userAgent: typeof ua === 'string' ? ua.slice(0, 512) : null,
  };
});
