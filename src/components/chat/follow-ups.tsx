'use client';

import { ArrowRight } from 'lucide-react';

/** Under the latest answer only: what to ask next, and the way to the live model. */
export function FollowUps({
  questions,
  onAsk,
  onAskLive,
}: {
  questions: string[];
  onAsk: (question: string) => void;
  /** Instant answers can be escalated to the live model. */
  onAskLive?: () => void;
}) {
  if (questions.length === 0 && !onAskLive) return null;
  return (
    <div className="followups">
      {questions.map((q) => (
        <button key={q} type="button" onClick={() => onAsk(q)} className="chip">
          {q}
        </button>
      ))}
      {onAskLive && (
        <button type="button" onClick={onAskLive} className="followups__live">
          Ask my AI twin live
          <ArrowRight aria-hidden className="text-btn__arrow h-4 w-4" />
        </button>
      )}
    </div>
  );
}
