import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AuthHeading } from '@/components/auth/auth-heading';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <>
      <AuthHeading
        title="Start learning backend engineering"
        description={
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-accent-text hover:underline">
              Sign in
            </Link>
          </>
        }
      />
      <Suspense>
        <RegisterForm />
      </Suspense>
    </>
  );
}
