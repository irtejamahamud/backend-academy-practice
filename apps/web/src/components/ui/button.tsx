import { Slot } from './slot';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

const variants = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
  secondary: 'bg-surface text-fg border border-border hover:bg-surface-muted',
  ghost: 'text-fg-muted hover:text-fg hover:bg-surface-muted',
  danger: 'bg-danger text-white hover:opacity-90',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-9 w-9',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  /** Render the single child element (e.g. a Link) with button styles. */
  asChild?: boolean;
}

export function buttonClasses(variant: keyof typeof variants = 'primary', size: keyof typeof sizes = 'md'): string {
  return cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-none font-medium transition-[background-color,color,transform] active:translate-y-px',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
  );
}

export function Button({ variant, size, loading, asChild, className, children, disabled, ...props }: ButtonProps) {
  const classes = cn(buttonClasses(variant, size), className);
  if (asChild) return <Slot className={classes}>{children}</Slot>;
  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
