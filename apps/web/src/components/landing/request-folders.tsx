'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type PhaseId = 'dns' | 'tcp' | 'tls' | 'server' | 'download';

interface Phase {
  id: PhaseId;
  name: string;
  module: number;
  folder: string;
  /** Tab position along the folder, as a share of its width: later phases start further right, like a waterfall. */
  at: number;
}

const PHASES: Phase[] = [
  { id: 'dns', name: 'DNS lookup', module: 2, folder: 'bg-folder-1', at: 0 },
  { id: 'tcp', name: 'TCP connect', module: 13, folder: 'bg-folder-2', at: 0.17 },
  { id: 'tls', name: 'TLS handshake', module: 7, folder: 'bg-folder-3', at: 0.34 },
  { id: 'server', name: 'Server response', module: 4, folder: 'bg-folder-4', at: 0.51 },
  { id: 'download', name: 'Download', module: 8, folder: 'bg-accent', at: 0.68 },
];

interface Timings {
  phases: Record<PhaseId, number>;
  total: number;
  secure: boolean;
}

/** Reads the browser's own Navigation Timing entry for the request that loaded this page. */
function readTimings(): Timings | null {
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!nav || nav.responseEnd === 0) return null;
  const secure = nav.secureConnectionStart > 0;
  const tls = secure ? nav.connectEnd - nav.secureConnectionStart : 0;
  return {
    phases: {
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      tcp: nav.connectEnd - nav.connectStart - tls,
      tls,
      server: nav.responseStart - nav.requestStart,
      download: nav.responseEnd - nav.responseStart,
    },
    total: nav.responseEnd - nav.startTime,
    secure,
  };
}

const ms = (v: number) => (v < 10 ? `${v.toFixed(1)} ms` : `${Math.round(v)} ms`);

function label(id: PhaseId, t: Timings | null): string {
  if (!t) return '…';
  if (id === 'tls' && !t.secure) return 'plain HTTP';
  if ((id === 'dns' || id === 'tcp') && t.phases[id] === 0) return 'reused';
  return ms(t.phases[id]);
}

export function RequestFolders() {
  const [timings, setTimings] = useState<Timings | null>(null);

  useEffect(() => {
    const read = () => setTimings(readTimings());
    if (document.readyState === 'complete') read();
    else window.addEventListener('load', read, { once: true });
    return () => window.removeEventListener('load', read);
  }, []);

  return (
    <div className="relative mx-auto w-full sm:w-[86%]" style={{ paddingTop: `calc(${PHASES.length - 1} * var(--step))` }}>
      {PHASES.map((p, i) => {
        const front = i === PHASES.length - 1;
        return (
          <div
            key={p.id}
            className={cn(front ? 'relative min-h-[max(30svh,240px)]' : 'absolute inset-x-0 bottom-0', p.folder)}
            style={front ? undefined : { top: `calc(${i} * var(--step))` }}
          >
            <a
              href={`#module-${p.module}`}
              className={cn(
                'tab-shape group absolute bottom-full flex h-[var(--tab)] items-center gap-3 px-6 text-[15px] transition-transform hover:-translate-y-1 sm:text-base',
                p.folder,
                front ? 'text-white' : 'text-night-ink',
              )}
              style={{ left: `clamp(0px, calc(${p.at} * 100%), calc(100% - 15rem))` }}
            >
              <span className="font-medium">{p.name}</span>
              <span className="tabular-nums text-white/90">{label(p.id, timings)}</span>
            </a>
            {front && (
              <div className="flex flex-col gap-6 px-6 pb-16 pt-7 text-white sm:px-10 md:flex-row md:items-start md:justify-between">
                <div className="order-first flex shrink-0 flex-wrap gap-3 md:order-none">
                  <Link
                    href="/register"
                    className="inline-flex h-12 items-center gap-2 bg-white px-6 font-medium text-[#171717] transition-transform hover:-translate-y-0.5 active:translate-y-px"
                  >
                    Start learning <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <a
                    href="#curriculum"
                    className="inline-flex h-12 items-center px-6 font-medium text-white underline-offset-4 transition-colors hover:underline"
                  >
                    Explore curriculum
                  </a>
                </div>
                <p className="max-w-[40ch] text-xl leading-snug">
                  {timings ? (
                    <>This page reached you in {ms(timings.total)}. </>
                  ) : (
                    <>Every page reaches you in five phases. </>
                  )}
                  Each tab is one phase of that request, and each one is a module you will learn to build.
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
