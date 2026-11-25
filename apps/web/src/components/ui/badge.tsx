import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

const tones = {
  neutral: 'bg-surface-muted text-fg-muted border-border',
  accent: 'bg-accent-soft text-accent-text border-accent/20',
  success: 'bg-success-soft text-success border-success/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
} as const;

export function Badge({ tone = 'neutral', className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', tones[tone], className)}
      {...props}
    />
  );
}
