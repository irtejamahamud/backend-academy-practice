import type { CookieOptions, Request, Response } from 'express';
import type { Env } from '../../config/env.js';
import type { AuthTokens } from './auth.service.js';

/** Cookie names are mirrored in apps/web/src/lib/auth-cookies.ts. */
export const ACCESS_COOKIE = 'ba_at';
export const REFRESH_COOKIE = 'ba_rt';

function base(env: Env): CookieOptions {
  return { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: 'lax', path: '/' };
}

export function setAuthCookies(res: Response, tokens: AuthTokens, env: Env): void {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, { ...base(env), maxAge: env.ACCESS_TOKEN_TTL_SECONDS * 1000 });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, { ...base(env), expires: tokens.refreshExpiresAt });
}

export function clearAuthCookies(res: Response, env: Env): void {
  res.clearCookie(ACCESS_COOKIE, base(env));
  res.clearCookie(REFRESH_COOKIE, base(env));
}

export function readCookie(req: Request, name: string): string | undefined {
  const value: unknown = req.cookies?.[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** Access token from the cookie, or from `Authorization: Bearer` for API clients and Swagger. */
export function readAccessToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim() || undefined;
  return readCookie(req, ACCESS_COOKIE);
}
