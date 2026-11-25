import { cn } from '@/lib/cn';

/**
 * The auth pages' side panel is a lesson preview: the exact sequence this form
 * runs, drawn as the site's one motif, a stack of tabbed folders.
 */
const STEPS = [
  { route: 'Browser → API', call: 'POST /auth/login', note: 'Email and password, over HTTPS.', folder: 'bg-folder-1' },
  { route: 'API → PostgreSQL', call: 'argon2id.verify()', note: 'The password is checked against its hash, never stored.', folder: 'bg-folder-2' },
  { route: 'API → PostgreSQL', call: 'INSERT session', note: 'Only a SHA-256 hash of the refresh token is kept.', folder: 'bg-folder-3' },
  { route: 'API → Browser', call: 'Set-Cookie', note: 'Access token for 15 minutes, refresh token for 30 days, both HttpOnly.', folder: 'bg-folder-4' },
  { route: 'Browser → API', call: 'POST /auth/refresh', note: 'Each refresh rotates the token. Reusing an old one signs every device out.', folder: 'bg-accent' },
];

export function AuthFlowPanel() {
  return (
    <div className="flex h-full flex-col bg-night px-10 pt-16 text-night-ink xl:px-16">
      <p className="max-w-[24ch] text-[clamp(28px,2.6vw,40px)] font-semibold leading-[1.1] tracking-[-0.03em]">
        This form runs the flow Module 5 teaches.
      </p>
      <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-night-muted">
        Short-lived access tokens, rotating refresh tokens and HttpOnly cookies. Here is every step between your
        password and your dashboard.
      </p>

      <ol className="relative mt-auto pt-20">
        {STEPS.map((s, i) => (
          <li key={s.call} className={cn('relative px-6 pb-14 pt-4', s.folder, i === STEPS.length - 1 && 'pb-16 text-white')}>
            <span
              className={cn('tab-shape absolute bottom-full flex h-9 items-center gap-3 px-6 text-sm', s.folder)}
              style={{ left: `${i * 12}%` }}
            >
              <code className="font-medium">{s.call}</code>
            </span>
            <p className="text-sm font-medium">{s.route}</p>
            <p className={cn('mt-0.5 max-w-[44ch] text-[15px] leading-relaxed', i === STEPS.length - 1 ? 'text-white/90' : 'text-night-muted')}>{s.note}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
