const FAQ = [
  {
    q: 'Who is Backend Academy for?',
    a: 'Developers who can already write basic code and want to become professional backend engineers: frontend developers moving server-side, junior backend developers filling gaps, and mid-level engineers preparing for senior roles and system design interviews.',
  },
  {
    q: 'Which languages and tools does it use?',
    a: 'TypeScript on Node.js for application code, PostgreSQL with Prisma for data, and Redis for caching and queues. Frameworks are NestJS and Elysia. The concepts carry over to any stack: every lesson explains why before it shows which.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'Not for lessons or practice. Code exercises run in an isolated sandbox and SQL exercises run against a practice database, in the browser. Projects are built on your machine with Docker, and each one includes setup instructions.',
  },
  {
    q: 'How are exams graded?',
    a: 'On the server. Objective questions are graded when you submit, and the answers are never sent to your browser beforehand. Architecture and written answers are reviewed by an instructor against a published rubric.',
  },
  {
    q: 'Can I skip what I already know?',
    a: 'Yes. Every module is self-contained and has its own exam. Pass the module exam and the module is marked complete, so experienced engineers can move straight to the material that is new to them.',
  },
  {
    q: 'How long does the whole curriculum take?',
    a: 'About 318 hours of guided study across 18 modules, plus projects. At eight hours a week that is roughly forty weeks. The calculator above works it out for your own pace.',
  },
];

export function FaqTiles() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-8 px-5 py-32 sm:px-8 lg:py-44">
      <div className="mx-auto grid max-w-[1240px] gap-10 lg:grid-cols-12 lg:gap-8">
        <h2
          id="faq-title"
          className="text-[clamp(36px,4.2vw,60px)] font-semibold leading-[1] tracking-[-0.035em] lg:sticky lg:top-24 lg:col-span-4 lg:self-start"
        >
          Questions, answered
        </h2>
        <div className="space-y-1.5 lg:col-span-8 lg:space-y-2">
          {FAQ.map(({ q, a }, i) => (
            <details
              key={q}
              name="faq"
              open={i === 0}
              data-reveal
              style={{ ['--i' as string]: i }}
              className="group bg-field-1 transition-colors open:bg-accent open:text-white"
            >
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 px-5 py-4 text-xl font-medium sm:min-h-[72px] sm:px-6 [&::-webkit-details-marker]:hidden">
                {q}
                <span aria-hidden className="relative size-4 shrink-0">
                  <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-current" />
                  <span className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-current transition-transform duration-200 group-open:rotate-90 group-open:opacity-0" />
                </span>
              </summary>
              <p className="max-w-[52ch] px-5 pb-6 text-base leading-relaxed sm:px-6">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
