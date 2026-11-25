import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/app/app-sidebar';
import { requireUser } from '@/lib/auth/session';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <AppSidebar user={user} />
      <main id="main" className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        {children}
      </main>
    </div>
  );
}
