'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { MODULES } from '@/lib/curriculum';

const STARTS = [
  { id: 'module-1', label: 'Module 1', detail: `${MODULES[0]!.title} · ${MODULES[0]!.hours} h`, heading: 'Start with Module\u00a01.' },
  { id: 'placement', label: 'Placement exam', detail: 'Skip the modules you already know', heading: 'Start where you are.' },
] as const;

const STEPS = ['Create your account', 'Confirm your email', 'Your first lesson opens'];

export function SignupOpen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [start, setStart] = useState<(typeof STARTS)[number]['id']>('module-1');
  const chosen = STARTS.find((s) => s.id === start)!;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ start });
    if (name.trim()) params.set('name', name.trim());
    router.push(`/register?${params}`);
  }

  return (
    <section aria-labelledby="cta-title" className="bg-accent px-5 py-24 text-white sm:px-8 lg:py-32">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-white/75">Free to start</p>
          <h2 id="cta-title" className="mt-4 max-w-[12ch] text-balance text-[clamp(44px,6vw,88px)] font-semibold leading-[0.95] tracking-[-0.04em]">
            {chosen.heading}
          </h2>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-white/85">
            It takes about fifteen minutes to get from here to your first lesson. If you already know the basics, take the
            placement exam instead.
          </p>

          <ol className="mt-10 grid max-w-[560px] border-t border-white/25 sm:grid-cols-3 sm:border-t-0">
            {STEPS.map((step, i) => (
              <li key={step} className="flex items-baseline gap-3 border-b border-white/25 py-3 sm:block sm:border-b-0 sm:border-t sm:pr-4 sm:pt-4">
                <span className="text-[13px] tabular-nums text-white/70">{String(i + 1).padStart(2, '0')}</span>
                <p className="text-[15px] font-medium sm:mt-1.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <form
          data-ui
          onSubmit={submit}
          className="w-full bg-surface p-6 text-fg shadow-lg sm:p-8 lg:col-span-5 lg:col-start-8 lg:justify-self-end lg:max-w-[480px]"
        >
          <p className="text-xl font-semibold tracking-tight">Create your account</p>
          <p className="mt-1 text-sm text-fg-muted">Free. You’ll add your email and password next.</p>

          <label htmlFor="cta-name" className="mt-7 block text-[13px] font-medium">Full name</label>
          <input
            id="cta-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Ada Lovelace"
            className="mt-1.5 h-12 w-full border border-border bg-surface px-3.5 text-[15px] placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-3 focus:ring-ring"
          />

          <fieldset className="mt-6">
            <legend className="text-[13px] font-medium">Start with</legend>
            <div className="mt-1.5 grid gap-2">
              {STARTS.map((s) => {
                const on = start === s.id;
                return (
                  <label
                    key={s.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 border p-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
                      on ? 'border-accent bg-accent-soft' : 'border-border hover:border-border-strong',
                    )}
                  >
                    <input type="radio" name="start" value={s.id} checked={on} onChange={() => setStart(s.id)} className="sr-only" />
                    <span aria-hidden className={cn('grid size-4 shrink-0 place-items-center rounded-full border', on ? 'border-accent' : 'border-border-strong')}>
                      {on && <span className="size-2 rounded-full bg-accent" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium">{s.label}</span>
                      <span className="block text-[13px] text-fg-muted">{s.detail}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            className="group mt-7 flex h-[52px] w-full items-center justify-center gap-2 bg-accent font-medium text-white transition-[background-color,transform] hover:bg-accent-hover active:translate-y-px"
          >
            {start === 'placement' ? 'Take the placement exam' : 'Start learning'}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>

          <p className="mt-5 text-center text-sm text-fg-muted">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-fg underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
