'use client';

import type { ReactNode } from 'react';

import { answerCopyText, renderAnswerCard } from './answer-cards';
import { MessageActions } from './message-actions';

interface PresetReplyProps {
  reply: string;
  tool: string;
  onRemove: () => void;
  /** Follow-ups, under the latest answer only. */
  footer?: ReactNode;
}

/** An instant answer: the twin's words on the page, then the card. Written by hand, so no typing. */
export function PresetReply({ reply, tool, onRemove, footer }: PresetReplyProps) {
  return (
    <article className="msg answer fade-in" aria-label="Instant answer">
      <p>{reply}</p>
      {renderAnswerCard(tool)}
      <div className="answer__foot">
        <MessageActions
          getText={() => answerCopyText(tool, reply)}
          onRemove={onRemove}
          removeLabel="Remove this answer from the conversation"
          label="Instant"
          labelTitle="Written by me, shown instantly with no AI call"
        />
        {footer}
      </div>
    </article>
  );
}
