'use client';

import { loginSchema } from '@academy/shared';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { authApi } from '@/lib/auth/api';
import { safeNext, useZodForm } from '@/lib/forms';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { errors, formError, pending, parse, run } = useZodForm(loginSchema);
  const [email, setEmail] = useState('');
  const [resent, setResent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = parse(e.currentTarget);
    if (!input) return;
    setEmail(input.email);
    void run(async () => {
      await authApi.login(input);
      router.replace(safeNext(params.get('next')));
      router.refresh();
    });
  }

  async function resend() {
    await authApi.resendVerification({ email }).catch(() => undefined);
    setResent(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {params.get('reset') === '1' && (
        <Alert tone="success" title="Password updated">
          Sign in with your new password.
        </Alert>
      )}
      {params.get('verified') === '1' && <Alert tone="success" title="Email verified">You can sign in now.</Alert>}

      {formError?.code === 'EMAIL_NOT_VERIFIED' ? (
        <Alert tone="info" title="Verify your email first">
          {resent ? (
            'A new verification link is on its way.'
          ) : (
            <>
              Check your inbox for the verification link.{' '}
              <button type="button" onClick={resend} className="font-medium text-accent-text underline-offset-2 hover:underline">
                Resend email
              </button>
            </>
          )}
        </Alert>
      ) : formError && formError.code !== 'VALIDATION_FAILED' ? (
        <Alert tone="error" title={formError.message} />
      ) : null}

      <Field id="email" label="Email" error={errors.email}>
        {(aria) => <Input {...aria} name="email" type="email" autoComplete="email" placeholder="you@company.com" required autoFocus />}
      </Field>

      <Field
        id="password"
        label="Password"
        error={errors.password}
        action={
          <Link href="/forgot-password" className="text-[13px] text-fg-muted hover:text-fg">
            Forgot password?
          </Link>
        }
      >
        {(aria) => <PasswordInput {...aria} name="password" autoComplete="current-password" required />}
      </Field>

      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Sign in
      </Button>
    </form>
  );
}
