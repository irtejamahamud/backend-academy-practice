import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthHeading } from '@/components/auth/auth-heading';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { Alert } from '@/components/ui/alert';

export const metadata: Metadata = { title: 'Choose a new password', referrer: 'no-referrer' };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <>
      <AuthHeading title="Choose a new password" />
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Alert tone="error" title="Missing reset token">
          Open the link from your email, or{' '}
          <Link href="/forgot-password" className="font-medium text-accent-text hover:underline">request a new one</Link>.
        </Alert>
      )}
    </>
  );
}
