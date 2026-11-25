import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { PermissionName } from '@academy/shared';
import type { Request } from 'express';
import { IS_PUBLIC, REQUIRED_PERMISSIONS } from '../../common/auth/decorators.js';
import { AppException } from '../../common/errors/app-exception.js';
import { accessOf, UsersRepository } from '../users/users.repository.js';
import { readAccessToken } from './auth.cookies.js';
import { TokenService } from './token.service.js';

/**
 * Global guard: every route requires a valid access token unless marked
 * @Public(). The user and session are re-loaded from the database on every
 * request so that revocation, disabling and role changes apply immediately.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
    private readonly users: UsersRepository,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()]);

    const token = readAccessToken(req);
    const claims = token ? await this.tokens.verifyAccessToken(token) : null;
    const user = claims ? await this.users.findActiveBySession(claims.userId, claims.sessionId) : null;

    if (user && claims) {
      req.user = {
        id: user.id,
        sessionId: claims.sessionId,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerifiedAt !== null,
        createdAt: user.createdAt,
        ...accessOf(user),
      };
    }

    if (isPublic) return true;
    if (!req.user) throw new AppException('UNAUTHENTICATED', 'Authentication required');
    return true;
  }
}

/** Global guard, runs after AuthGuard: enforces @RequirePermissions(). */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<PermissionName[] | undefined>(REQUIRED_PERMISSIONS, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required?.length) return true;

    const user = ctx.switchToHttp().getRequest<Request>().user;
    if (!user) throw new AppException('UNAUTHENTICATED', 'Authentication required');
    const granted = new Set(user.permissions);
    if (!required.every((p) => granted.has(p))) {
      throw new AppException('FORBIDDEN', 'You do not have permission to perform this action');
    }
    return true;
  }
}
