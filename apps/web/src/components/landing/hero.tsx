import Link from 'next/link';
import { RequestFolders } from './request-folders';

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-night text-night-ink [--step:48px] [--tab:34px] sm:[--step:56px] sm:[--tab:40px]"
    >
      <header className="relative z-10 grid h-16 grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
        <span />
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          Backend Academy
        </Link>
        <Link
          href={signedIn ? '/dashboard' : '/login'}
          className="justify-self-end text-[15px] text-night-muted transition-colors hover:text-night-ink"
        >
          {signedIn ? 'Dashboard' : 'Sign in'}
        </Link>
      </header>

      <div className="px-5 pt-10 text-center sm:px-8 sm:pt-12">
        <h1
          id="hero-title"
          data-reveal
          className="mx-auto max-w-[14ch] text-[clamp(44px,8.6vw,132px)] font-semibold leading-[0.95] tracking-[-0.045em] text-balance"
        >
          Master Backend Engineering.
        </h1>
        <p data-reveal style={{ ['--i' as string]: 1 }} className="mx-auto mt-6 max-w-[54ch] text-xl leading-relaxed text-night-muted">
          <span className="text-night-ink">Build systems that scale.</span> Learn backend engineering from the
          fundamentals to production-grade architecture through interactive lessons, real-world examples, coding
          exercises and practical examinations.
        </p>
      </div>

      <div className="mt-auto pt-16">
        <RequestFolders />
      </div>
    </section>
  );
}
