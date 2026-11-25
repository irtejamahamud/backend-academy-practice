import Image from 'next/image';
import { cn } from '@/lib/cn';
import { PROJECTS } from '@/lib/curriculum';
import { ArchiveVideo } from './archive-video';

/**
 * A packed grid with no empty cells. A wide tile spans two columns at 8:5 and a single tile is 4:5,
 * so both come out the same height and every row closes flush.
 * Desktop rows: [intro, wide, single] [single, wide, single] [4 singles] [single, single, wide].
 */
const WIDE_ALWAYS = new Set([0, 3]);
const WIDE_DESKTOP = new Set([11]); // single on phones, so the two-column grid pairs up evenly

export function ProjectsGrid() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-8 px-[5vw] py-28 lg:py-36">
      <div className="grid grid-flow-row-dense grid-cols-2 gap-x-2.5 gap-y-10 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-12">
        <div data-reveal className="col-span-2 flex flex-col justify-between gap-6 lg:col-span-1 lg:pb-9 lg:pr-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-fg-muted">What you build</p>
            <h2 id="projects-title" className="mt-3 text-[clamp(36px,4.2vw,60px)] font-semibold leading-[1] tracking-[-0.035em]">
              Twelve<br />projects
            </h2>
          </div>
          <p className="max-w-[34ch] text-base leading-relaxed text-fg-muted">
            Each backend you build replaced something people once did by hand. Every project ships with requirements,
            architecture, schema, API spec, tests, deployment and a final review.
          </p>
        </div>

        {PROJECTS.map((p, k) => {
          const wide = WIDE_ALWAYS.has(k);
          const wideDesktop = wide || WIDE_DESKTOP.has(k);
          const video = p.image === '/archive/chat-still.jpg';
          return (
            <figure
              key={p.title}
              data-reveal
              style={{ ['--i' as string]: k % 4 }}
              className={cn('group', wide && 'col-span-2', wideDesktop && 'lg:col-span-2')}
            >
              <div
                className={cn(
                  'relative overflow-hidden bg-surface-muted',
                  wide ? 'aspect-[8/5]' : 'aspect-[4/5]',
                  wideDesktop && 'lg:aspect-[8/5]',
                )}
              >
                {video ? (
                  <ArchiveVideo src="/archive/switchboard.mp4" poster={p.image} label={`Archival film: ${p.ancestor.toLowerCase()} routing calls, ${p.year}`} />
                ) : (
                  <Image
                    src={p.image}
                    alt={p.alt}
                    fill
                    sizes={wideDesktop ? '(min-width: 1024px) 45vw, 90vw' : '(min-width: 1024px) 22vw, 45vw'}
                    className="object-cover grayscale transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
                  />
                )}
                <span className="absolute left-0 top-0 bg-bg px-2 py-1 text-[12px] font-medium tabular-nums">
                  {String(k + 1).padStart(2, '0')}
                </span>
              </div>
              <figcaption className={cn('mt-3 flex flex-col gap-0.5 text-[15px] leading-snug', wideDesktop && 'sm:flex-row sm:justify-between sm:gap-4')}>
                <span className="font-medium">{p.title}</span>
                <span className="shrink-0 text-fg-muted">
                  {p.ancestor}, {p.year}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
