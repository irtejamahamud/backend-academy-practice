'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

const QUESTION = {
  prompt:
    'A client presents a refresh token that your server already rotated two minutes ago. What should the server do?',
  options: [
    { id: 'a', text: 'Issue a new access token. The token is still within its 30-day lifetime.' },
    { id: 'b', text: 'Reject it and revoke every token in that session’s rotation family.' },
    { id: 'c', text: 'Reject it, but leave the newer token in the family valid.' },
    { id: 'd', text: 'Ask the client to re-send it with the access token attached.' },
  ],
  answer: 'b',
  explanation:
    'A rotated token should never be seen again. Its reappearance means two parties hold tokens from the same session, and the server cannot tell which one is the attacker. Revoking the whole family logs both out, which limits the damage of a stolen token. Most implementations allow a short grace window for benign races between parallel requests.',
};

export function PracticeQuiz() {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const correct = selected === QUESTION.answer;

  return (
    <div data-ui className="bg-surface p-5 sm:p-6">
      <p className="text-[13px] text-fg-muted">Module 5 · Scenario question · Intermediate</p>
      <fieldset className="mt-4">
        <legend className="text-base font-medium leading-relaxed">{QUESTION.prompt}</legend>
        <div className="mt-4 space-y-2">
          {QUESTION.options.map((o) => {
            const isAnswer = submitted && o.id === QUESTION.answer;
            const isWrongPick = submitted && o.id === selected && !correct;
            return (
              <label
                key={o.id}
                className={cn(
                  'flex cursor-pointer gap-3 border p-3 text-[15px] transition-colors',
                  selected === o.id && !submitted ? 'border-accent bg-accent-soft' : 'border-border hover:bg-surface-muted',
                  isAnswer && 'border-success/50 bg-success-soft',
                  isWrongPick && 'border-danger/50 bg-danger-soft',
                  submitted && 'cursor-default',
                )}
              >
                <input
                  type="radio"
                  name="quiz-demo"
                  value={o.id}
                  disabled={submitted}
                  checked={selected === o.id}
                  onChange={() => setSelected(o.id)}
                  className="mt-0.5 accent-[var(--accent)]"
                />
                <span className="flex-1">{o.text}</span>
                {isAnswer && <CheckCircle2 className="size-4 text-success" aria-label="Correct answer" />}
                {isWrongPick && <XCircle className="size-4 text-danger" aria-label="Your answer" />}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite">
        {submitted ? (
          <div className="mt-4 bg-surface-muted p-4 text-[15px] leading-relaxed">
            <p className={cn('font-medium', correct ? 'text-success' : 'text-danger')}>
              {correct ? 'Correct.' : 'Not quite.'}
            </p>
            <p className="mt-1 text-fg-muted">{QUESTION.explanation}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex gap-2">
        {submitted ? (
          <Button variant="secondary" onClick={() => { setSubmitted(false); setSelected(null); }}>Try again</Button>
        ) : (
          <Button disabled={!selected} onClick={() => setSubmitted(true)}>Check answer</Button>
        )}
      </div>
    </div>
  );
}
