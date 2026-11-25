import { cloneElement, isValidElement, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Minimal Slot: merges className onto its single child element. */
export function Slot({ children, className }: { children: ReactNode; className?: string }) {
  if (!isValidElement<{ className?: string }>(children)) return null;
  return cloneElement(children, { className: cn(className, children.props.className) });
}
