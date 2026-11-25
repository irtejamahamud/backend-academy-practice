import { cn } from '@/lib/cn';

interface Stage {
  clause: string;
  field: string;
  ink: string;
  done: number;
  lines: [string, string][];
  status: string;
}

const STAGES: Stage[] = [
  {
    clause: 'First you read and run it.',
    field: 'bg-field-1',
    ink: 'text-fg',
    done: 0,
    status: 'Not started',
    lines: [['Lessons', '0 of 11'], ['Estimated', '16 hours']],
  },
  {
    clause: 'Then you practise it.',
    field: 'bg-field-2',
    ink: 'text-fg',
    done: 7,
    status: 'In progress',
    lines: [['Lessons', '7 of 11'], ['Exercises', '9 passed']],
  },
  {
    clause: 'Then an exam finds gaps.',
    field: 'bg-accent',
    ink: 'text-white',
    done: 11,
    status: 'Exam taken',
    lines: [['Module exam', '84%'], ['Review', 'Dead-letter queues']],
  },
  {
    clause: 'Then you build it for real.',
    field: 'bg-night',
    ink: 'text-night-ink',
    done: 11,
    status: 'Completed',
    lines: [['Project', 'Notification Service'], ['Review', 'Passed']],
  },
];

export function ModuleJourney() {
  return (
    <section aria-labelledby="journey-title" className="grid lg:grid-cols-4">
      {STAGES.map((s, i) => (
        <div key={s.clause} className={cn('relative flex min-h-[64svh] flex-col p-5 lg:min-h-[84svh] lg:p-7', s.field, s.ink)}>
          {i === 0 && (
            <h2 id="journey-title" className="text-xl font-bold">
              How a module works
            </h2>
          )}
          <div
            data-ui
            data-reveal
            style={{ ['--i' as string]: i }}
            className="mt-8 w-[260px] bg-surface p-4 text-fg shadow-lg transition-transform duration-150 hover:-translate-y-1.5 lg:absolute lg:left-1/2 lg:top-[38%] lg:mt-0 lg:-translate-x-1/2"
          >
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-fg-muted">Module 9</span>
              <span className={cn('font-medium', s.status === 'Completed' ? 'text-success' : 'text-accent-text')}>{s.status}</span>
            </div>
            <p className="mt-1.5 text-[15px] font-semibold leading-snug">Background jobs and messaging</p>
            <div className="mt-3 h-1.5 bg-surface-muted">
              <div className="h-full bg-accent" style={{ width: `${(s.done / 11) * 100}%` }} />
            </div>
            <dl className="mt-3 space-y-1 text-[13px]">
              {s.lines.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-fg-muted">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mt-10 max-w-[14ch] text-[clamp(26px,2.9vw,42px)] font-semibold leading-[1.1] tracking-[-0.03em] lg:mt-auto">
            {s.clause}
          </p>
        </div>
      ))}
    </section>
  );
}
