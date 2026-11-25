'use client';

import { PASSWORD_MIN_LENGTH, registerSchema } from '@academy/shared';
import { MailCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { authApi } from '@/lib/auth/api';
import { useZodForm } from '@/lib/forms';

export function RegisterForm() {
  const { errors, formError, pending, parse, run } = useZodForm(registerSchema);
  const [sentTo, setSentTo] = useState<string | null>(null);
  // Carried over from the landing page's sign-up step.
  const presetName = useSearchParams().get('name')?.slice(0, 80) ?? '';

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = parse(e.currentTarget);
    if (!input) return;
    void run(async () => {
      await authApi.register(input);
      setSentTo(input.email);
    });
  }

  if (sentTo) return <CheckInbox email={sentTo} />;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && formError.code !== 'VALIDATION_FAILED' && <Alert tone="error" title={formError.message} />}

      <Field id="name" label="Full name" error={errors.name}>
        {(aria) => <Input {...aria} name="name" autoComplete="name" placeholder="Ada Lovelace" defaultValue={presetName} required autoFocus={!presetName} />}
      </Field>
      <Field id="email" label="Email" error={errors.email}>
        {(aria) => <Input {...aria} name="email" type="email" autoComplete="email" placeholder="you@company.com" required autoFocus={!!presetName} />}
      </Field>
      <Field
        id="password"
        label="Password"
        error={errors.password}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters, with a number or symbol. A passphrase works well.`}
      >
        {(aria) => <PasswordInput {...aria} name="password" autoComplete="new-password" required />}
      </Field>

      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Create account
      </Button>
    </form>
  );
}

function CheckInbox({ email }: { email: string }) {
  const [resent, setResent] = useState(false);
  return (
    <div className="space-y-5">
      <div className="grid size-11 place-items-center bg-accent-soft">
        <MailCheck className="size-5 text-accent-text" aria-hidden />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Check your inbox</h2>
        <p className="mt-1.5 text-sm text-fg-muted">
          We sent a verification link to <span className="font-medium text-fg">{email}</span>. It expires in 24 hours.
        </p>
      </div>
      {resent ? (
        <Alert tone="success" title="Sent again">If it still doesn’t arrive, check your spam folder.</Alert>
      ) : (
        <Button
          variant="secondary"
          className="w-full"
          onClick={async () => {
            await authApi.resendVerification({ email }).catch(() => undefined);
            setResent(true);
          }}
        >
          Resend verification email
        </Button>
      )}
    </div>
  );
}
