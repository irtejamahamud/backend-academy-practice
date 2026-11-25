import { MODULES, PATHS, TOTAL_TOPICS } from '@/lib/curriculum';

const MAX_HOURS = Math.max(...MODULES.map((m) => m.hours));

export function CurriculumMenu() {
  const byNumber = new Map(MODULES.map((m) => [m.number, m]));

  return (
    <section id="curriculum" aria-labelledby="curriculum-title" className="scroll-mt-8 px-5 py-32 sm:px-8 lg:py-44">
      <div className="mx-auto max-w-[1240px]">
        <h2
          id="curriculum-title"
          data-reveal
          className="max-w-[18ch] text-[clamp(36px,4.2vw,60px)] font-semibold leading-[1] tracking-[-0.035em]"
        >
          Eighteen modules, read in three paths.
        </h2>
        <p data-reveal style={{ ['--i' as string]: 1 }} className="mt-6 max-w-[56ch] text-xl leading-relaxed">
          {TOTAL_TOPICS} topics in all. Each bar is a module’s length in hours, so you can see where the depth is
          before you start. Open any module for its full topic list.
        </p>

        {PATHS.map((path) => {
          const modules = path.modules.map((n) => byNumber.get(n)!);
          const hours = modules.reduce((sum, m) => sum + m.hours, 0);
          return (
            <div key={path.slug} className="mt-24 first-of-type:mt-24">
              <div data-reveal className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                <h3 className="text-[clamp(26px,2.9vw,42px)] font-semibold leading-[1.1] tracking-[-0.03em]">{path.title}</h3>
                <p className="text-base tabular-nums text-fg-muted">
                  {modules.length} modules · {hours} hours
                </p>
              </div>
              <p data-reveal className="mt-3 max-w-[62ch] text-base leading-relaxed">
                {path.description} <span className="text-fg-muted">For: {path.outcome.toLowerCase()}.</span>
              </p>

              <ul className="mt-10 grid gap-x-16 gap-y-9 md:grid-cols-2">
                {modules.map((m, i) => (
                  <li key={m.slug} id={`module-${m.number}`} data-reveal style={{ ['--i' as string]: i % 2 }} className="grid scroll-mt-24 grid-cols-[52px_minmax(0,1fr)] gap-x-5 sm:grid-cols-[64px_minmax(0,1fr)]">
                    <span aria-hidden className="mt-[9px] block h-3 bg-accent" style={{ width: `${Math.max(18, (m.hours / MAX_HOURS) * 100)}%` }} />
                    <div>
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="text-xl font-semibold leading-snug">
                          {m.title}
                        </p>
                        <p className="shrink-0 text-base tabular-nums">{m.hours} h</p>
                      </div>
                      <p className="mt-1.5 max-w-[44ch] text-base leading-relaxed text-fg-muted">{m.summary}</p>
                      <details className="group mt-2">
                        <summary className="cursor-pointer list-none text-base font-medium text-accent-text [&::-webkit-details-marker]:hidden">
                          <span className="group-open:hidden">Module {m.number} · {m.level} · all {m.topics.length} topics</span>
                          <span className="hidden group-open:inline">Hide topics</span>
                        </summary>
                        <p className="mt-2 max-w-[52ch] text-base leading-relaxed">{m.topics.join(', ')}.</p>
                      </details>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
