import Link from 'next/link';
import { cn } from '@/lib/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-6', className)} aria-hidden>
      <rect width="24" height="24" rx="6" className="fill-fg" />
      <path d="M7 8h10M7 12h6M7 16h8" className="stroke-bg" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17" cy="12" r="1.6" fill="#635BFF" />
    </svg>
  );
}

export function Logo({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn('inline-flex items-center gap-2 font-semibold tracking-tight text-fg', className)}>
      <LogoMark />
      <span>Backend Academy</span>
    </Link>
  );
}
