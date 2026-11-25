'use client';

import { ArrowRight, Check, Clock } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Highlight } from './highlight';

const CODE = `export async function getProduct(id: string) {
  const key = \`product:\${id}\`;

  // 1. Try the cache first
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // 2. Miss: read the source of truth
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return null;

  // 3. Store it with a TTL so stale data expires
  await redis.set(key, JSON.stringify(product), 'EX', 300);
  return product;
}`;

// Interface fragment (data-ui): the lesson window keeps its own border, dividers and floating shadow.
const FRAGMENT = 'border border-border bg-surface shadow-lg'; // taste-skill-ignore

interface View {
  id: string;
  name: string;
  fact: string;
  field: string;
  body: ReactNode;
}

const VIEWS: View[] = [
  {
    id: 'read',
    name: 'Explanation',
    fact: 'Every lesson follows the same arc: what it is, why it exists, how it works inside, and when not to use it.',
    field: 'bg-field-2',
    body: (
      <div className="space-y-4 text-base leading-7 text-fg">
        <p>
          In <strong>cache-aside</strong>, the application owns the cache. On a read it checks the cache first; on a
          miss it reads the database and writes the result back for next time.
        </p>
        <p className="text-fg-muted">
          The cache only holds data someone asked for, and a Redis outage costs speed, not availability: every read
          simply falls through to PostgreSQL.
        </p>
        <ol className="grid gap-px sm:grid-cols-3 border border-border bg-border text-[13px]">
          {['Check Redis', 'Miss: query PostgreSQL', 'Write back with a TTL'].map((step, i) => (
            <li key={step} className="bg-surface-muted px-3 py-2.5 leading-snug">
              <span className="mr-2 font-mono text-[11px] text-accent sm:mr-0 sm:block">0{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
        <div className="border-l-2 border-warning bg-warning-soft px-4 py-3 text-[15px]">
          <p className="font-semibold">Common mistake</p>
          <p className="mt-1 text-fg-muted">Forgetting a TTL. One missed invalidation then serves stale data forever.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'code',
    name: 'Code',
    fact: 'Code is real TypeScript, PostgreSQL and Prisma, explained line by line, and runnable in the playground.',
    field: 'bg-night',
    body: (
      <pre className="overflow-x-auto bg-surface-muted p-4 text-[13px] leading-6">
        <code>
          <Highlight code={CODE} />
        </code>
      </pre>
    ),
  },
  {
    id: 'diagram',
    name: 'Diagram',
    fact: 'Diagrams are drawn to teach one idea each: sequence, ER, request lifecycle, queue and deployment.',
    field: 'bg-accent',
    body: <CacheDiagram />,
  },
  {
    id: 'check',
    name: 'Knowledge check',
    fact: 'Each lesson closes with questions graded on the server, with an explanation for every answer.',
    field: 'bg-field-1',
    body: (
      <div className="space-y-2.5 text-[15px]">
        <p className="text-base font-medium">Why does cache-aside survive a Redis outage?</p>
        {[
          ['Reads fall through to the database', true],
          ['Redis replicates to PostgreSQL', false],
          ['Writes are buffered in memory', false],
        ].map(([text, right]) => (
          <p key={String(text)} className={cn('flex items-center gap-3 border px-3 py-2.5', right ? 'border-success/40 bg-success-soft' : 'border-border')}>
            <span className={cn('grid size-4 place-items-center rounded-full border', right ? 'border-success bg-success text-white' : 'border-border-strong')}>
              {right ? <Check className="size-2.5" strokeWidth={3} aria-hidden /> : null}
            </span>
            {text}
          </p>
        ))}
        <p className="pt-2 leading-relaxed text-fg-muted">
          Correct. The database stays the source of truth, so a cache miss, or a missing cache, only costs latency.
        </p>
      </div>
    ),
  },
];

const DWELL_MS = 7000;

export function LessonShowcase() {
  const [active, setActive] = useState(0);
  // Views play through on their own until the reader picks one; motion-sensitive readers never get autoplay.
  const [auto, setAuto] = useState(false);
  const [paused, setPaused] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const view = VIEWS[active]!;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setAuto(true);
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setPaused(!entry!.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const choose = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = VIEWS.length - 1;
    const next =
      e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (i === last ? 0 : i + 1)
      : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    choose(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="lesson-title"
      className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 py-24 sm:px-8 lg:min-h-[100svh] lg:grid-cols-12 lg:gap-16 lg:py-32"
    >
      <div className="min-w-0 lg:col-span-4">
        <h2 id="lesson-title" className="text-sm font-medium uppercase tracking-[0.12em] text-fg-muted">
          Inside a lesson
        </h2>
        <p className="mt-3 max-w-[22ch] text-lg leading-snug text-fg-muted">
          One concept, taught four ways. Pick a view to see it.
        </p>

        <div role="tablist" aria-label="Lesson views" aria-orientation="vertical" className="mt-10 border-t border-border">
          {VIEWS.map((v, i) => {
            const on = i === active;
            return (
              <div key={v.id} className="relative border-b border-border">
                <button
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`lesson-tab-${v.id}`}
                  role="tab"
                  aria-selected={on}
                  aria-controls="lesson-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => choose(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    'group flex w-full items-baseline gap-4 py-4 text-left transition-colors duration-200',
                    on ? 'text-fg' : 'text-fg-muted hover:text-fg',
                  )}
                >
                  <span className="w-6 shrink-0 text-sm tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[clamp(24px,2.4vw,36px)] font-semibold leading-[1.1] tracking-[-0.03em]">{v.name}</span>
                </button>
                {/* The fact sits under its own label, so the eye never has to cross the screen to read it. */}
                <div
                  className={cn(
                    'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
                    on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <p className="overflow-hidden pl-10 text-base leading-relaxed text-fg-muted">
                    <span className="block max-w-[38ch] pb-5">{v.fact}</span>
                  </p>
                </div>
                {on && (
                  <span
                    aria-hidden
                    key={`${v.id}-${auto}`}
                    onAnimationEnd={() => auto && setActive((active + 1) % VIEWS.length)}
                    className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-accent"
                    style={
                      auto
                        ? { animation: `lesson-progress ${DWELL_MS}ms linear`, animationPlayState: paused ? 'paused' : 'running' }
                        : undefined
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* The motif: a folder, its colour set by the chosen view, holding the lesson window. */}
      <div
        onMouseEnter={() => auto && setPaused(true)}
        onMouseLeave={() => auto && setPaused(false)}
        className={cn('relative mt-10 min-w-0 px-4 py-10 transition-colors duration-300 sm:px-10 sm:py-14 lg:col-span-8 lg:mt-0 lg:px-16 lg:py-20', view.field)}
      >
        <span aria-hidden className={cn('tab-shape absolute bottom-full left-0 h-10 w-56 transition-colors duration-300', view.field)} />

        <div data-ui className={cn(FRAGMENT, 'mx-auto flex max-w-[640px] flex-col')}>
          <div className="flex items-center gap-3 border-b border-border px-5 py-3.5 sm:px-7">
            <span className="grid size-9 shrink-0 place-items-center bg-accent text-[13px] font-semibold tabular-nums text-white">8.3</span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-[12px] uppercase tracking-[0.1em] text-fg-muted">
                Module 8<span className="sm:hidden"> · 14 min</span>
              </p>
              <p className="truncate text-[15px] font-medium">Caching and performance</p>
            </div>
            <span className="hidden shrink-0 items-center gap-1.5 text-[13px] sm:flex tabular-nums text-fg-muted">
              <Clock className="size-3.5" aria-hidden />
              14 min
            </span>
          </div>

          {/* Lesson progress: one segment per view, filled up to the one on screen. */}
          <div aria-hidden className="flex gap-1 px-5 pt-5 sm:px-7">
            {VIEWS.map((v, i) => (
              <span key={v.id} className={cn('h-1 flex-1 transition-colors duration-300', i <= active ? 'bg-accent' : 'bg-border')} />
            ))}
          </div>

          <div id="lesson-panel" role="tabpanel" aria-labelledby={`lesson-tab-${view.id}`} className="flex-1 px-5 pb-6 pt-4 sm:px-7 sm:pb-8">
            <p className="text-[12px] font-medium uppercase tracking-[0.1em] text-accent">
              Part {active + 1} of {VIEWS.length} · {view.name}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">The cache-aside pattern</p>
            {/* Every view shares one grid cell, so the window keeps the tallest view's height and never jumps. */}
            <div className="mt-5 grid grid-cols-[minmax(0,1fr)]">
              {VIEWS.map((v, i) => (
                <div
                  key={v.id}
                  aria-hidden={i !== active}
                  className={cn(
                    'col-start-1 row-start-1 min-w-0 transition-opacity duration-[240ms]',
                    i === active ? 'opacity-100' : 'invisible opacity-0',
                  )}
                >
                  {v.body}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border bg-surface-muted px-5 py-3 sm:px-7">
            <span className="hidden text-[13px] text-fg-muted sm:inline">Progress saves as you read</span>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => choose((active + 1) % VIEWS.length)}
              className="group ml-auto flex items-center gap-2 whitespace-nowrap text-[14px] font-medium text-fg transition-colors hover:text-accent"
            >
              {active === VIEWS.length - 1 ? 'Start over' : `Next: ${VIEWS[active + 1]!.name}`}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CacheDiagram() {
  const boxes = [
    { x: 8, y: 70, label: 'API' },
    { x: 230, y: 10, label: 'Redis' },
    { x: 230, y: 130, label: 'PostgreSQL' },
  ];
  return (
    <svg viewBox="0 0 360 190" className="w-full" role="img" aria-label="The API reads Redis first. On a miss it queries PostgreSQL, then writes the result into Redis with a TTL.">
      <defs>
        <marker id="lc-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" className="fill-accent" />
        </marker>
      </defs>
      {boxes.map((b) => (
        <g key={b.label} transform={`translate(${b.x},${b.y})`}>
          <rect width="120" height="48" className="fill-surface-muted stroke-border-strong" />
          <text x="60" y="29" textAnchor="middle" className="fill-fg text-[13px] font-semibold">{b.label}</text>
        </g>
      ))}
      <path d="M128,82 L228,40" className="stroke-accent" strokeWidth="1.6" fill="none" markerEnd="url(#lc-arrow)" />
      <text x="96" y="34" className="fill-fg text-[11px]">1 GET · 3 SET EX 300</text>
      <path d="M128,106 L228,150" className="stroke-accent" strokeWidth="1.6" strokeDasharray="4 3" fill="none" markerEnd="url(#lc-arrow)" />
      <text x="112" y="164" className="fill-fg text-[11px]">2 miss → SELECT</text>
    </svg>
  );
}
