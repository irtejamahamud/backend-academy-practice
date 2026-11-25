import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AuthHeading } from '@/components/auth/auth-heading';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <>
      <AuthHeading
        title="Welcome back"
        description={
          <>
            New here?{' '}
            <Link href="/register" className="font-medium text-accent-text hover:underline">
              Create an account
            </Link>
          </>
        }
      />
      <Suspense>
        <LoginForm />
      </Suspense>
    </>
  );
}
