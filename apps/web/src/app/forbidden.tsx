import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Forbidden() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-sm text-center">
        <p className="text-sm text-fg-subtle">403</p>
        <h1 className="mt-2 text-xl font-semibold">You don’t have access to this page</h1>
        <p className="mt-2 text-sm text-fg-muted">If you think this is a mistake, contact an administrator.</p>
        <Button asChild variant="secondary" className="mt-6">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
