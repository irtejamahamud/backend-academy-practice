import { Fragment, type ReactNode } from 'react';

/**
 * Tiny TypeScript highlighter for static marketing snippets only.
 * Lesson pages use a full highlighter (Shiki) in Phase 5.
 */
const TOKEN = /(\/\/.*$)|('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(const|let|await|async|return|if|function|export|import|from|new|null|throw)\b|\b(\d+)\b|(\b[A-Za-z_]\w*)(?=\()/gm;

export function Highlight({ code }: { code: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(code.slice(last, i));
    const [text, comment, str, kw, num, fn] = m;
    const cls = comment ? 'text-fg-muted italic' : str ? 'text-success' : kw ? 'text-accent-text' : num ? 'text-warning' : fn ? 'text-fg font-medium' : '';
    out.push(<span key={i} className={cls}>{text}</span>);
    last = i + text.length;
  }
  out.push(code.slice(last));
  return <>{out.map((n, i) => <Fragment key={i}>{n}</Fragment>)}</>;
}
