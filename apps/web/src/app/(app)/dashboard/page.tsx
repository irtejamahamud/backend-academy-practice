import { BookOpen, Map } from 'lucide-react';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MODULES } from '@/lib/curriculum';
import { requireUser } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const user = await requireUser();
  const firstName = user.name.split(' ')[0];
  const firstModules = MODULES.slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <p className="text-sm text-fg-muted">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Welcome, {firstName}</h1>
        <p className="mt-2 max-w-2xl text-sm text-fg-muted">
          Your progress, study time, streaks and exam results will appear here as you work through the curriculum.
        </p>
      </header>

      <section aria-labelledby="start" className="mt-10">
        <h2 id="start" className="text-sm font-medium">Where to start</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {firstModules.map((m) => (
            <Card key={m.slug} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-fg-subtle">Module {m.number}</span>
                <Badge tone={m.level === 'Foundation' ? 'success' : 'accent'}>{m.level}</Badge>
              </div>
              <h3 className="mt-3 font-medium">{m.title}</h3>
              <p className="mt-1.5 text-sm text-fg-muted">{m.summary}</p>
              <p className="mt-4 text-xs text-fg-subtle">{m.topics.length} topics · ~{m.hours}h</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <Card className="flex items-start gap-4 p-5">
          <Map className="mt-0.5 size-5 text-accent-text" aria-hidden />
          <div>
            <h2 className="font-medium">Learning roadmap</h2>
            <p className="mt-1 text-sm text-fg-muted">
              18 modules, from programming fundamentals to system design. The interactive roadmap is next.
            </p>
          </div>
        </Card>
        <Card className="flex items-start gap-4 p-5">
          <BookOpen className="mt-0.5 size-5 text-accent-text" aria-hidden />
          <div>
            <h2 className="font-medium">Account</h2>
            <p className="mt-1 text-sm text-fg-muted">
              Signed in as {user.email} · <span className="capitalize">{user.roles.join(', ').toLowerCase()}</span>
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
