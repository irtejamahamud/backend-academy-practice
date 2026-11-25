import { cn } from '@/lib/cn';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import type { ReactNode } from 'react';

const tones = {
  info: { cls: 'bg-accent-soft text-fg border-accent/20', Icon: Info, iconCls: 'text-accent-text' },
  success: { cls: 'bg-success-soft text-fg border-success/25', Icon: CheckCircle2, iconCls: 'text-success' },
  error: { cls: 'bg-danger-soft text-fg border-danger/25', Icon: AlertCircle, iconCls: 'text-danger' },
} as const;

export function Alert({ tone = 'info', title, children, className }: { tone?: keyof typeof tones; title?: string; children?: ReactNode; className?: string }) {
  const { cls, Icon, iconCls } = tones[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-lg border p-3.5 text-sm', cls, className)}>
      <Icon className={cn('mt-0.5 size-4 shrink-0', iconCls)} aria-hidden />
      <div className="space-y-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-fg-muted">{children}</div>}
      </div>
    </div>
  );
}
