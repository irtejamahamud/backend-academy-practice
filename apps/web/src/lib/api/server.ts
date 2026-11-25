import 'server-only';
import type { ApiSuccess } from '@academy/shared';
import { cookies, headers } from 'next/headers';
import { ACCESS_COOKIE } from '../auth/cookies';
import { ApiError } from './errors';

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

/** Server-side API call on behalf of the signed-in user (forwards the access cookie and request id). */
export async function serverApi<T>(path: string): Promise<T> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const requestId = (await headers()).get('x-request-id');
  const res = await fetch(`${API}/api/v1${path}`, {
    headers: {
      ...(token ? { cookie: `${ACCESS_COOKIE}=${token}` } : {}),
      ...(requestId ? { 'x-request-id': requestId } : {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw await ApiError.from(res);
  return ((await res.json()) as ApiSuccess<T>).data;
}
