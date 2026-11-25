import { type NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE } from './lib/auth/cookies';

const API = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';
const PROTECTED = ['/dashboard', '/admin', '/settings'];
const GUEST_ONLY = ['/login', '/register'];

const matches = (path: string, prefixes: string[]) => prefixes.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * Runs before rendering. When the short-lived access cookie has expired but a
 * refresh cookie exists, it rotates the session server-side so pages render
 * signed in without a client round-trip. It only routes; it never authorises.
 * Authorisation happens in the API on every request.
 */
export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname, search } = req.nextUrl;
  let hasAccess = req.cookies.has(ACCESS_COOKIE);
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  let refreshed: string[] | null = null;
  let refreshFailed = false;

  if (!hasAccess && refreshToken) {
    refreshed = await refresh(req, refreshToken);
    refreshFailed = refreshed === null;
    hasAccess = refreshed !== null && refreshed.some((c) => c.startsWith(`${ACCESS_COOKIE}=`));
  }

  let res: NextResponse;
  if (matches(pathname, PROTECTED) && !hasAccess) {
    const login = new URL('/login', req.url);
    login.searchParams.set('next', pathname + search);
    res = NextResponse.redirect(login);
  } else if (matches(pathname, GUEST_ONLY) && hasAccess) {
    res = NextResponse.redirect(new URL('/dashboard', req.url));
  } else if (refreshed) {
    // Forward the new cookies to this render as well as to the browser.
    const headers = new Headers(req.headers);
    headers.set('cookie', mergeCookies(req.headers.get('cookie') ?? '', refreshed));
    res = NextResponse.next({ request: { headers } });
  } else {
    res = NextResponse.next();
  }

  for (const c of refreshed ?? []) res.headers.append('set-cookie', c);
  // A dead refresh cookie would otherwise trigger a refresh attempt on every navigation.
  if (refreshFailed) res.cookies.delete(REFRESH_COOKIE);
  return res;
}

async function refresh(req: NextRequest, refreshToken: string): Promise<string[] | null> {
  try {
    const r = await fetch(`${API}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        cookie: `${REFRESH_COOKIE}=${refreshToken}`,
        'user-agent': req.headers.get('user-agent') ?? '',
        'x-forwarded-for': req.headers.get('x-forwarded-for') ?? '',
        'x-request-id': req.headers.get('x-request-id') ?? crypto.randomUUID(),
      },
      cache: 'no-store',
    });
    if (!r.ok) return null;
    return r.headers.getSetCookie();
  } catch {
    return null;
  }
}

function mergeCookies(original: string, setCookies: string[]): string {
  const jar = new Map<string, string>();
  for (const part of original.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k) jar.set(k, v.join('='));
  }
  for (const sc of setCookies) {
    const [pair] = sc.split(';');
    const [k, ...v] = (pair ?? '').split('=');
    if (k) jar.set(k.trim(), v.join('='));
  }
  return [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
}

export const config = {
  // Skip API proxying, static assets and Next internals.
  matcher: ['/((?!api/|_next/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml)$).*)'],
};
