import type { PublicUser } from '@academy/shared';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { serverApi } from '@/lib/api/server';
import { requirePermission } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Admin' };

interface UserPage {
  items: PublicUser[];
  total: number;
}

const date = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

export default async function AdminPage() {
  await requirePermission('users:read');
  const { items, total } = await serverApi<UserPage>('/users?pageSize=50');

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <p className="text-sm text-fg-muted">Admin</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-2 text-sm text-fg-muted">{total} registered accounts. Content management arrives in Phase 3.</p>
      </header>

      <Card className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs text-fg-muted">{/* taste-skill-ignore: real data table */}
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Name</th>
              <th scope="col" className="px-5 py-3 font-medium">Email</th>
              <th scope="col" className="px-5 py-3 font-medium">Role</th>
              <th scope="col" className="px-5 py-3 font-medium">Status</th>
              <th scope="col" className="px-5 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">{/* taste-skill-ignore: real data table */}
            {items.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3 font-medium">{u.name}</td>
                <td className="px-5 py-3 text-fg-muted">{u.email}</td>
                <td className="px-5 py-3">
                  {u.roles.map((r) => (
                    <Badge key={r} tone={r === 'ADMIN' ? 'accent' : 'neutral'}>{r.toLowerCase()}</Badge>
                  ))}
                </td>
                <td className="px-5 py-3">
                  <Badge tone={u.emailVerified ? 'success' : 'warning'}>{u.emailVerified ? 'Verified' : 'Unverified'}</Badge>
                </td>
                <td className="px-5 py-3 text-fg-muted">{date.format(new Date(u.createdAt))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
