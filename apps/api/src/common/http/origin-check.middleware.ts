import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { ENV } from '../../config/config.module.js';
import type { Env } from '../../config/env.js';
import { AppException } from '../errors/app-exception.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence in depth. Auth cookies are SameSite=Lax, which already stops
 * cross-site POSTs from carrying them; this additionally rejects any
 * state-changing browser request whose Origin is not the web app.
 * Server-to-server calls (no Origin, no Sec-Fetch-Site) are allowed.
 */
@Injectable()
export class OriginCheckMiddleware implements NestMiddleware {
  private readonly allowed: string;

  constructor(@Inject(ENV) env: Env) {
    this.allowed = new URL(env.WEB_ORIGIN).origin;
  }

  use(req: Request, _res: Response, next: NextFunction): void {
    if (SAFE_METHODS.has(req.method)) return next();

    const origin = req.headers.origin;
    if (origin !== undefined && origin !== this.allowed) {
      return next(new AppException('FORBIDDEN', 'Cross-origin request rejected'));
    }
    if (origin === undefined && req.headers['sec-fetch-site'] === 'cross-site') {
      return next(new AppException('FORBIDDEN', 'Cross-site request rejected'));
    }
    next();
  }
}
