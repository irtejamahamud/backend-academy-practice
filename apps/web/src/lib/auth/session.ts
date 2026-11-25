import 'server-only';
import type { ApiSuccess, PermissionName, PublicUser } from '@academy/shared';
import { cookies } from 'next/headers';
import { forbidden, redirect } from 'next/navigation';
import { cache } from 'react';
import { ACCESS_COOKIE } from './cookies';

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

/**
 * The signed-in user for this request, or null. Deduplicated per request.
 * The API is the authority: this asks it rather than decoding the JWT here.
 */
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  try {
    const res = await fetch(`${API}/api/v1/auth/me`, {
      headers: { cookie: `${ACCESS_COOKIE}=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return ((await res.json()) as ApiSuccess<{ user: PublicUser }>).data.user;
  } catch {
    return null;
  }
});

export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

/** UI-level gate. The API enforces the same permission on every request regardless. */
export async function requirePermission(permission: PermissionName): Promise<PublicUser> {
  const user = await requireUser();
  if (!user.permissions.includes(permission)) forbidden();
  return user;
}
