import { cn } from '@/lib/cn';
import type { InputHTMLAttributes } from 'react';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-none border border-border bg-surface px-3 text-[15px] text-fg transition-colors',
        'placeholder:text-fg-subtle',
        'focus:border-accent focus:outline-none focus:ring-3 focus:ring-ring',
        'aria-invalid:border-danger aria-invalid:focus:ring-danger/20',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}
