'use client';

import { useState } from 'react';
import type { z, ZodType } from 'zod';
import { ApiError } from './api/errors';

/**
 * Minimal form state for Zod-validated forms. Validates with the same shared
 * schema the API uses, and maps API field errors back onto inputs.
 */
export function useZodForm<T extends ZodType>(schema: T) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<ApiError | null>(null);
  const [pending, setPending] = useState(false);

  function parse(form: HTMLFormElement): z.output<T> | null {
    const raw = Object.fromEntries(new FormData(form));
    const result = schema.safeParse(raw);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    const next: Record<string, string> = {};
    for (const issue of result.error.issues) next[issue.path.join('.')] ??= issue.message;
    setErrors(next);
    form.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`)?.focus();
    return null;
  }

  async function run(fn: () => Promise<void>): Promise<void> {
    setPending(true);
    setFormError(null);
    try {
      await fn();
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : new ApiError(0, 'INTERNAL_ERROR', 'Something went wrong.');
      if (apiErr.code === 'VALIDATION_FAILED') setErrors(apiErr.fieldErrors());
      setFormError(apiErr);
    } finally {
      setPending(false);
    }
  }

  return { errors, formError, pending, parse, run, setFormError };
}

/** Only allow same-site relative redirects after login (prevents open redirects). */
export function safeNext(next: string | null | undefined, fallback = '/dashboard'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}
