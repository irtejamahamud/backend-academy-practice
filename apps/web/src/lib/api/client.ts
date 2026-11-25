import type { ApiSuccess } from '@academy/shared';
import { ApiError, NETWORK_ERROR } from './errors';

const BASE = '/api/v1';
let refreshing: Promise<boolean> | null = null;

/** One in-flight refresh shared by every caller, so parallel 401s don't race each other. */
function refreshOnce(): Promise<boolean> {
  refreshing ??= fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'same-origin' })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Skip the automatic refresh-and-retry on 401 (used by the auth endpoints themselves). */
  noRetry?: boolean;
}

/** Browser-side API client. Goes through the same-origin /api rewrite so auth cookies are first-party. */
export async function api<T>(path: string, { method = 'GET', body, noRetry }: RequestOptions = {}): Promise<T> {
  const init: RequestInit = {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  };

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, init);
    if (res.status === 401 && !noRetry && (await refreshOnce())) {
      res = await fetch(`${BASE}${path}`, init);
    }
  } catch {
    throw NETWORK_ERROR;
  }

  if (!res.ok) throw await ApiError.from(res);
  if (res.status === 204) return undefined as T;
  return ((await res.json()) as ApiSuccess<T>).data;
}
