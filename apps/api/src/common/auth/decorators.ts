import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common';
import type { PermissionName } from '@academy/shared';
import type { Request } from 'express';
import { AppException } from '../errors/app-exception.js';
import type { AuthUser } from './auth-user.js';

export const IS_PUBLIC = 'auth:isPublic';
export const REQUIRED_PERMISSIONS = 'auth:permissions';

/** Opts a route out of the global authentication guard. */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC, true);

/** Requires the caller to hold every listed permission. Checked server-side on each request. */
export const RequirePermissions = (...permissions: PermissionName[]): MethodDecorator & ClassDecorator =>
  SetMetadata(REQUIRED_PERMISSIONS, permissions);

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthUser => {
  const req = ctx.switchToHttp().getRequest<Request>();
  if (!req.user) throw new AppException('UNAUTHENTICATED', 'Authentication required');
  return req.user;
});
