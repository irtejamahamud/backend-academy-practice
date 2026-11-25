'use client';

import type { PublicUser } from '@academy/shared';
import {
  BookOpen,
  ClipboardCheck,
  Code2,
  FolderGit2,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Shield,
  X,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { authApi } from '@/lib/auth/api';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Planned sections render disabled until their phase ships. */
  soon?: boolean;
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/roadmap', label: 'Roadmap', icon: Map, soon: true },
  { href: '/learn', label: 'Courses', icon: BookOpen, soon: true },
  { href: '/practice', label: 'Practice', icon: Code2, soon: true },
  { href: '/exams', label: 'Exams', icon: ClipboardCheck, soon: true },
  { href: '/projects', label: 'Projects', icon: FolderGit2, soon: true },
];

export function AppSidebar({ user }: { user: PublicUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = user.permissions.includes('users:read');

  async function signOut() {
    await authApi.logout().catch(() => undefined);
    router.replace('/login');
    router.refresh();
  }

  const items = isAdmin ? [...NAV, { href: '/admin', label: 'Admin', icon: Shield }] : NAV;

  return (
    <>
      <div className="flex h-14 items-center justify-between bg-surface px-5 lg:hidden">
        <Logo href="/dashboard" />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="app-nav"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          className="grid size-9 place-items-center rounded-md text-fg-muted hover:bg-surface-muted"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <aside
        id="app-nav"
        className={cn(
          'flex-col bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh',
          open ? 'flex' : 'hidden',
        )}
      >
        <div className="hidden h-16 items-center px-5 lg:flex">
          <Logo href="/dashboard" />
        </div>
        <nav aria-label="Main" className="flex-1 space-y-0.5 px-3 py-3">
          {items.map(({ href, label, icon: Icon, soon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const cls = cn(
              'flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors',
              active ? 'bg-surface-muted font-medium text-fg' : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
              soon && 'cursor-default opacity-60 hover:bg-transparent hover:text-fg-muted',
            );
            const content = (
              <>
                <Icon className="size-4" aria-hidden />
                <span className="flex-1">{label}</span>
                {soon && <span className="text-[10px] font-medium uppercase tracking-wide text-fg-subtle">Soon</span>}
              </>
            );
            return soon ? (
              <span key={href} className={cls} aria-disabled="true">{content}</span>
            ) : (
              <Link key={href} href={href} className={cls} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)}>
                {content}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-4 bg-surface-muted p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent-text" aria-hidden>
              {initials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-fg-muted">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              title="Sign out"
              aria-label="Sign out"
              className="grid size-8 place-items-center rounded-md text-fg-muted hover:bg-surface-muted hover:text-fg"
            >
              <LogOut className="size-4" />
            </button>
          </div>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
