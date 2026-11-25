import { Check, Flag, Play } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { PracticeQuiz } from './practice-quiz';

const TYPES = [
  'Multiple choice',
  'True or false',
  'Fill in the blanks',
  'Code completion',
  'SQL queries',
  'Find the bug',
  'Debugging',
  'Scenarios',
  'Architecture design',
];

/** A board tile: its demo sits on top, its caption is pinned to the bottom, and nothing is cropped. */
function Tile({ className, title, line, children, dark }: { className?: string; title?: string; line?: string; children?: ReactNode; dark?: boolean }) {
  return (
    <div data-reveal className={cn('flex flex-col p-5 sm:p-6', className)}>
      {children}
      {title && (
        <div className={cn('mt-auto pt-6', dark ? 'text-night-ink' : 'text-fg')}>
          <p className="text-lg font-semibold">{title}</p>
          <p className={cn('mt-0.5 max-w-[36ch] text-[15px] leading-relaxed', dark ? 'text-white/80' : 'text-fg-muted')}>{line}</p>
        </div>
      )}
    </div>
  );
}

const TESTS = ['returns the cached product', 'reads the database on a miss', 'stores the result with a TTL', 'returns null for unknown ids'];

// Question map for the review tile: a = answered, f = flagged, - = still open.
const MAP = ['a', 'a', 'f', 'a', '-', 'a', 'f', '-', 'a', '-'];

export function PracticeBoard() {
  return (
    <section aria-labelledby="practice-title" className="px-2.5 py-28 sm:px-4 lg:py-40">
      <div className="mx-auto grid max-w-[1400px] gap-2 lg:grid-cols-12">
        <div className="flex flex-col gap-2 lg:col-span-7">
          <Tile className="bg-field-2 sm:p-8 lg:p-10">
            <h2 id="practice-title" className="text-[clamp(36px,4.2vw,60px)] font-semibold leading-[1] tracking-[-0.035em]">
              Practice that pushes back.
            </h2>
            <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-fg-muted">
              Nine kinds of question, from quick recall to full system design. Every answer is graded on the server, and
              every answer comes with the reasoning.
            </p>
            <ul aria-label="Question types" className="mt-6 flex flex-wrap gap-1.5">
              {TYPES.map((t) => (
                <li key={t} className="border border-fg/10 bg-surface/60 px-3 py-1.5 text-[13px] font-medium">
                  {t}
                </li>
              ))}
            </ul>
          </Tile>

          <Tile className="flex-1 justify-center bg-field-1 p-3 sm:p-6">
            <PracticeQuiz />
          </Tile>
        </div>

        <div className="flex flex-col gap-2 lg:col-span-5">
          <Tile className="bg-night" dark title="Code exercises" line="TypeScript runs in an isolated sandbox against hidden tests.">
            <div data-ui aria-hidden className="border border-white/10 bg-white/[0.04] text-[13px]">
              <div className="flex items-center justify-between border-b border-white/10 py-2 pl-4 pr-2">
                <span className="font-mono text-white/70">get-product.ts</span>
                <span className="inline-flex items-center gap-1.5 bg-accent px-3 py-1.5 font-semibold text-white">
                  <Play className="size-3 fill-current" /> Run
                </span>
              </div>
              <ul className="space-y-1.5 px-4 py-3">
                {TESTS.map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-white/85">
                    <Check className="size-3.5 shrink-0 text-[#4ade80]" strokeWidth={3} />
                    <span className="truncate">{t}</span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-white/10 px-4 py-2 font-mono text-[#4ade80]">4 / 4 tests passed · 38 ms</p>
            </div>
          </Tile>

          <div className="grid gap-2 sm:grid-cols-2">
            <Tile className="bg-accent" dark title="Timed exams" line="Submitted automatically when time runs out.">
              <div data-ui aria-hidden>
                <p className="text-[clamp(48px,4.6vw,68px)] font-semibold leading-none tracking-[-0.04em] text-white tabular-nums">28:41</p>
                <div className="mt-4 h-1 bg-white/25">
                  <div className="h-full w-[64%] bg-white" />
                </div>
                <p className="mt-2 text-[13px] text-white/80">Question 14 of 40</p>
              </div>
            </Tile>

            <Tile className="bg-field-2" title="Mark for review" line="Skip, flag and return before you submit.">
              <ol data-ui aria-hidden className="grid max-w-[300px] grid-cols-5 gap-1.5">
                {MAP.map((s, i) => (
                  <li
                    key={i}
                    className={cn(
                      'relative grid aspect-square place-items-center text-[13px] font-medium tabular-nums',
                      s === 'a' && 'bg-fg text-bg',
                      s === 'f' && 'border-2 border-accent bg-surface text-accent',
                      s === '-' && 'border border-fg/15 bg-surface/60 text-fg-muted',
                    )}
                  >
                    {i + 1}
                    {s === 'f' && <Flag className="absolute -right-1 -top-1 size-3.5 fill-accent text-accent" />}
                  </li>
                ))}
              </ol>
            </Tile>
          </div>

          <Tile className="flex-1 bg-surface-muted" title="SQL against a real database" line="Write queries, read the execution plan, fix the slow one.">
            <div data-ui aria-hidden className="border border-border bg-surface">
              <pre className="overflow-x-auto px-4 py-3 text-[13px] leading-6 text-fg">
                <code>
                  <span className="text-accent-text">EXPLAIN ANALYZE</span> SELECT * FROM orders{'\n'}WHERE user_id = <span className="text-warning">42</span>;
                </code>
              </pre>
              <div className="grid grid-cols-2 border-t border-border text-[13px]">
                <div className="border-r border-border px-4 py-2.5">
                  <p className="text-fg-muted">Before · Seq Scan</p>
                  <p className="mt-0.5 font-mono font-semibold text-danger">182.4 ms</p>
                </div>
                <div className="px-4 py-2.5">
                  <p className="text-fg-muted">After · Index Scan</p>
                  <p className="mt-0.5 font-mono font-semibold text-success">0.044 ms</p>
                </div>
              </div>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}
