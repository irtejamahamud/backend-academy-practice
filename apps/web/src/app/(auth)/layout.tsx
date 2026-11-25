import type { ReactNode } from 'react';
import { AuthFlowPanel } from '@/components/auth/auth-flow-panel';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-6 py-6 sm:px-10">
        <header className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </header>
        <main id="main" className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[400px]">{children}</div>
        </main>
        <footer className="text-xs text-fg-subtle">© {new Date().getFullYear()} Backend Academy</footer>
      </div>
      <aside className="hidden lg:block" aria-label="How sign-in works">
        <AuthFlowPanel />
      </aside>
    </div>
  );
}
