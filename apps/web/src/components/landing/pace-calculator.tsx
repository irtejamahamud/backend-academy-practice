'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/cn';
import { MODULES, TOTAL_HOURS } from '@/lib/curriculum';

const PRESETS = [
  { label: 'Evenings', hours: 5 },
  { label: 'Steady', hours: 8 },
  { label: 'Focused', hours: 15 },
  { label: 'Full time', hours: 30 },
];

/** Each module's start and end week at a given pace, in course order. */
function schedule(hours: number) {
  let done = 0;
  return MODULES.map((m) => {
    const start = done;
    done += m.hours;
    return { ...m, start, end: done, from: Math.floor(start / hours) + 1, to: Math.max(1, Math.ceil(done / hours)) };
  });
}

function duration(weeks: number) {
  const months = Math.round(weeks / 4.345);
  if (weeks < 9) return `about ${weeks} weeks`;
  if (months < 12) return `about ${months} months`;
  const years = weeks / 52;
  return `about ${years < 1.25 ? 'a year' : `${years.toFixed(1).replace('.0', '')} years`}`;
}

export function PaceCalculator() {
  const [hours, setHours] = useState(8);
  const id = useId();
  const weeks = Math.ceil(TOTAL_HOURS / hours);
  const rows = schedule(hours);
  // The axis is at least one year long, so a fast pace visibly finishes early and a slow one stretches past it.
  const axis = Math.max(52, Math.ceil(weeks / 13) * 13);
  const ticks = Array.from({ length: axis / 13 + 1 }, (_, i) => i * 13);
  const pct = (h: number) => `${(h / hours / axis) * 100}%`;

  return (
    <section aria-labelledby={`${id}-q`} className="bg-field-2 px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="flex flex-col lg:col-span-5">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-fg-muted">Your pace</p>
          <h2 id={`${id}-q`} className="mt-3 text-[clamp(30px,3.4vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">
            How many hours a week?
          </h2>
          <p className="mt-4 max-w-[42ch] text-base leading-relaxed text-fg-muted">
            {TOTAL_HOURS} hours of lessons, exercises and exams across {MODULES.length} modules. Pick a pace and see
            when you would reach each one.
          </p>

          <div data-ui className="mt-10">
            <div className="flex items-baseline justify-between text-[15px]">
              <label htmlFor={id} className="font-medium">Study time</label>
              <output htmlFor={id} className="tabular-nums">{hours} hours a week</output>
            </div>
            <input
              id={id}
              type="range"
              min={2}
              max={30}
              step={1}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="mt-3 h-11 w-full cursor-pointer accent-[var(--accent)]"
            />
            <div className="mt-1 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  aria-pressed={hours === p.hours}
                  onClick={() => setHours(p.hours)}
                  className={cn(
                    'border px-3 py-2 text-left text-[13px] transition-colors',
                    hours === p.hours ? 'border-fg bg-fg text-bg' : 'border-fg/15 bg-surface/60 hover:border-fg/40',
                  )}
                >
                  <span className="block font-medium">{p.label}</span>
                  <span className={cn('tabular-nums', hours === p.hours ? 'text-bg/70' : 'text-fg-muted')}>{p.hours} h / week</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 lg:mt-auto lg:pt-12">
            <p aria-live="polite" className="flex items-baseline gap-3 font-semibold tabular-nums">
              <span className="text-[clamp(96px,11vw,168px)] leading-[0.8] tracking-[-0.05em]">{weeks}</span>
              <span className="text-[clamp(24px,2.4vw,34px)] tracking-[-0.03em]">weeks</span>
            </p>
            <p className="mt-4 max-w-[40ch] text-[15px] leading-relaxed text-fg-muted">
              That is {duration(weeks)}. Projects take time on top, and your dashboard tracks the real pace once you start.
            </p>
          </div>
        </div>

        <div data-ui className="min-w-0 border border-border bg-surface p-5 shadow-lg sm:p-7 lg:col-span-7">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-semibold">Your schedule</p>
            <p className="text-[13px] tabular-nums text-fg-muted">Week 1 to {weeks}</p>
          </div>

          <ol className="mt-5 space-y-2.5 sm:space-y-1.5">
            {rows.map((m) => (
              <li key={m.slug} className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-[13px] sm:grid-cols-[1.75rem_11rem_minmax(0,1fr)_4.5rem]">
                <span className="tabular-nums text-fg-muted">{String(m.number).padStart(2, '0')}</span>
                <span className="truncate font-medium">{m.title}</span>
                <span className="relative h-2 bg-surface-muted [grid-column:1/-1] sm:row-start-1 sm:[grid-column:3]">
                  <span
                    className="absolute inset-y-0 bg-accent transition-[left,width] duration-300 ease-out"
                    style={{ left: pct(m.start), width: `max(2px, ${pct(m.hours)})` }}
                  />
                </span>
                <span className="col-start-3 row-start-1 text-right tabular-nums text-fg-muted sm:col-start-4">
                  {m.from === m.to ? `Wk ${m.from}` : `Wk ${m.from}–${m.to}`}
                </span>
              </li>
            ))}
          </ol>

          {/* Week axis, aligned with the bar column. */}
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)] border-t border-border pt-2 text-[12px] tabular-nums text-fg-muted sm:grid-cols-[1.75rem_11rem_minmax(0,1fr)_4.5rem] sm:gap-x-3">
            <div className="relative h-4 sm:[grid-column:3]">
              {ticks.map((t, i) => (
                <span
                  key={t}
                  className={cn('absolute top-0 whitespace-nowrap', i === 0 ? '' : i === ticks.length - 1 ? '-translate-x-full' : '-translate-x-1/2')}
                  style={{ left: `${(t / axis) * 100}%` }}
                >
                  {t === 52 ? '1 yr' : t === 104 ? '2 yr' : t === 156 ? '3 yr' : t === 0 ? '0' : `${t}w`}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
