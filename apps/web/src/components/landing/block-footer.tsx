import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MODULES } from '@/lib/curriculum';
import credits from '../../../public/archive/credits.json';

const WORDS = ['BACKEND', 'ACADEMY'];
const MAX = Math.max(...MODULES.map((m) => m.hours));
const MIN = Math.min(...MODULES.map((m) => m.hours));

/** Each letter's block height is one module's length in hours (modules 1–14), scaled to 60–100% of the band. */
function heightFor(index: number): number {
  const h = MODULES[index % MODULES.length]!.hours;
  return 60 + ((h - MIN) / (MAX - MIN)) * 40;
}

interface Credit {
  title: string;
  creator?: string | null;
  license: string;
  page: string;
}

const LINKS = [
  { title: 'Learn', items: [['Curriculum', '#curriculum'], ['Projects', '#projects'], ['Questions', '#faq']] },
  { title: 'Account', items: [['Create account', '/register'], ['Sign in', '/login'], ['Reset password', '/forgot-password']] },
] as const;

export function BlockFooter() {
  let letter = 0;
  return (
    <footer className="bg-field-1 px-4 pb-8 pt-20 sm:px-8">
      <div aria-label="Backend Academy" role="img" className="flex flex-col gap-1 lg:flex-row lg:gap-8">
        {WORDS.map((word) => (
          <div key={word} className="flex h-[22svh] flex-1 items-end gap-1 lg:h-[34svh]">
            {[...word].map((ch) => {
              const height = heightFor(letter++);
              return (
                <span
                  key={`${word}-${letter}`}
                  aria-hidden
                  className="flex flex-1 items-end justify-center bg-fg pb-[0.06em] text-[10vw] font-bold leading-none tracking-[-0.04em] text-field-1 lg:text-[6.2vw]"
                  style={{ height: `${height}%` }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-12">
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 lg:col-span-5">
          {LINKS.map((col) => (
            <div key={col.title}>
              <p className="text-[15px] font-semibold">{col.title}</p>
              <ul className="mt-3 space-y-2 text-[15px]">
                {col.items.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="underline-offset-4 hover:underline">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="lg:col-span-7">
          <p className="text-[15px] font-semibold">Pictures and footage</p>
          <p className="mt-3 text-[15px] leading-relaxed">
            Archival pictures of the systems each project replaced:{' '}
            {(credits as Credit[]).map((c, i, all) => (
              <span key={c.page}>
                <a href={c.page} className="underline underline-offset-2" rel="noreferrer" target="_blank">
                  {c.title.length > 64 ? `${c.title.slice(0, 62)}…` : c.title}
                </a>
                {c.creator && !/unknown/i.test(c.creator) ? ` by ${c.creator}` : ''}, {c.license}
                {i < all.length - 1 ? '; ' : '.'}
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 text-[15px]">
        <p>© {new Date().getFullYear()} Backend Academy</p>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a href="#main" className="inline-flex h-9 items-center bg-fg px-4 text-sm font-medium text-bg transition-transform hover:-translate-y-0.5">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
