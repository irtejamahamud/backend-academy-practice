import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthHeading } from '@/components/auth/auth-heading';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = { title: 'Reset password' };

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading title="Reset your password" description="Enter your email and we’ll send you a link to choose a new password." />
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-fg-muted">
        <Link href="/login" className="hover:text-fg">← Back to sign in</Link>
      </p>
    </>
  );
}
