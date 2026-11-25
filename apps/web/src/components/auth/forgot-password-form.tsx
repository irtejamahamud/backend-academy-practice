'use client';

import { emailOnlySchema } from '@academy/shared';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/auth/api';
import { useZodForm } from '@/lib/forms';

export function ForgotPasswordForm() {
  const { errors, formError, pending, parse, run } = useZodForm(emailOnlySchema);
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = parse(e.currentTarget);
    if (!input) return;
    void run(async () => {
      await authApi.forgotPassword(input);
      setSent(true);
    });
  }

  if (sent) {
    return (
      <Alert tone="success" title="Check your email">
        If an account exists for that address, a reset link is on its way. It expires in 30 minutes.
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && formError.code !== 'VALIDATION_FAILED' && <Alert tone="error" title={formError.message} />}
      <Field id="email" label="Email" error={errors.email}>
        {(aria) => <Input {...aria} name="email" type="email" autoComplete="email" placeholder="you@company.com" required autoFocus />}
      </Field>
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Send reset link
      </Button>
    </form>
  );
}
