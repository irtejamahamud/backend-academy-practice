'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/errors';
import { authApi } from '@/lib/auth/api';

type State = { status: 'verifying' } | { status: 'done' } | { status: 'error'; message: string };

/** Verifies on mount. Guarded against React strict-mode double effects, since tokens are single-use. */
export function VerifyEmail({ token }: { token: string }) {
  const [state, setState] = useState<State>({ status: 'verifying' });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    authApi
      .verifyEmail(token)
      .then(() => setState({ status: 'done' }))
      .catch((err: unknown) =>
        setState({ status: 'error', message: err instanceof ApiError ? err.message : 'Verification failed.' }),
      );
  }, [token]);

  if (state.status === 'verifying') {
    return <p className="text-sm text-fg-muted" role="status">Verifying your email…</p>;
  }
  if (state.status === 'error') {
    return (
      <div className="space-y-5">
        <Alert tone="error" title={state.message}>
          Links expire after 24 hours and work once. Sign in to request a new one.
        </Alert>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <Alert tone="success" title="Email verified">Your account is active.</Alert>
      <Button asChild className="w-full" size="lg">
        <Link href="/login?verified=1">Continue to sign in</Link>
      </Button>
    </div>
  );
}
