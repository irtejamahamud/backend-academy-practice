import type { ReactNode } from 'react';

export function AuthHeading({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="mb-10">
      <h1 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] text-balance">{title}</h1>
      {description && <p className="mt-3 text-base text-fg-muted">{description}</p>}
    </div>
  );
}
