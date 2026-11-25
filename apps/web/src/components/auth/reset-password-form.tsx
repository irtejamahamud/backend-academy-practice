'use client';

import { PASSWORD_MIN_LENGTH, resetPasswordSchema } from '@academy/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import { authApi } from '@/lib/auth/api';
import { useZodForm } from '@/lib/forms';

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { errors, formError, pending, parse, run } = useZodForm(resetPasswordSchema);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = parse(e.currentTarget);
    if (!input) return;
    void run(async () => {
      await authApi.resetPassword(input);
      router.replace('/login?reset=1');
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError?.code === 'INVALID_TOKEN' ? (
        <Alert tone="error" title="This link is invalid or has expired">
          <Link href="/forgot-password" className="font-medium text-accent-text hover:underline">
            Request a new reset link
          </Link>
        </Alert>
      ) : formError && formError.code !== 'VALIDATION_FAILED' ? (
        <Alert tone="error" title={formError.message} />
      ) : null}
      <input type="hidden" name="token" value={token} />
      <Field
        id="password"
        label="New password"
        error={errors.password}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters, with a number or symbol.`}
      >
        {(aria) => <PasswordInput {...aria} name="password" autoComplete="new-password" required autoFocus />}
      </Field>
      <p className="text-[13px] text-fg-muted">For your security, this signs you out on every device.</p>
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Update password
      </Button>
    </form>
  );
}
