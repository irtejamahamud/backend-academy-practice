import type { Metadata } from 'next';
import { AuthHeading } from '@/components/auth/auth-heading';
import { VerifyEmail } from '@/components/auth/verify-email';
import { Alert } from '@/components/ui/alert';

export const metadata: Metadata = { title: 'Verify email', referrer: 'no-referrer' };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <>
      <AuthHeading title="Email verification" />
      {token ? <VerifyEmail token={token} /> : <Alert tone="error" title="Missing verification token">Open the link from your email.</Alert>}
    </>
  );
}
