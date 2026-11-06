'use client';

import { getToolName, isToolUIPart, type UIMessage } from 'ai';
import type { ReactNode } from 'react';
import { TOOL_LABELS } from '@/lib/answers';
import { hasContent, textOf } from '@/lib/message-text';
import { renderAnswerCard } from './answer-cards';
import ChatMessageContent from './chat-message-content';
import { MessageActions } from './message-actions';
import { usePanel } from './side-panel';

const isFinished = (state: string) =>
  state === 'output-available' || state === 'output-error' || state === 'output-denied';

export { hasContent, textOf };

/** The word itself carries the light. Shown only after 300ms, so fast replies never flicker. */
export function Thinking() {
  return (
    <p className="thinking">
      <span className="shimmer">Thinking</span>
    </p>
  );
}

/** Marks an answer that the visitor stopped, or a question stopped before any answer came. */
export function StoppedTurn({
  onRemove,
  footer,
}: {
  onRemove: () => void;
  footer?: ReactNode;
}) {
  return (
    <article className="msg answer fade-in" aria-label="Answer">
      <div className="answer__foot">
        <MessageActions
          getText={() => ''}
          onRemove={onRemove}
          removeLabel="Remove this question and its answer"
          label="Stopped"
          canCopy={false}
        />
        {footer}
      </div>
    </article>
  );
}

/** Shaped like the card on its way. Appears only if the tool is taking a moment. */
function CardPlaceholder() {
  return (
    <div aria-hidden className="card answer-card answer-card--placeholder">
      <span style={{ width: '38%' }} />
      <span style={{ width: '92%' }} />
      <span style={{ width: '74%' }} />
      <span style={{ width: '46%' }} />
      <span className="answer-card__placeholder-btn" />
    </div>
  );
}

interface AssistantTurnProps {
  message: UIMessage;
  /** This turn is the one still arriving. */
  isStreaming: boolean;
  /** The visitor pressed stop on this turn. */
  stopped: boolean;
  onRemove: () => void;
  /** Follow-ups, under the latest answer only. */
  footer?: ReactNode;
}

/**
 * One live answer, in the order it really happens: one plain line per tool step,
 * the tool's card, then the words. It owns no scroll container; the transcript scrolls.
 */
export function AssistantTurn({
  message,
  isStreaming,
  stopped,
  onRemove,
  footer,
}: AssistantTurnProps) {
  const { open } = usePanel();
  if (message.role !== 'assistant') return null;

  const parts = message.parts ?? [];
  // Only tools this app knows how to name and show. Never a name, JSON or a file.
  const tools = parts
    .filter(isToolUIPart)
    .map((part) => ({ part, name: getToolName(part) }))
    .filter(({ name }) => TOOL_LABELS[name]);
  const done = tools.filter(({ part }) => part.state === 'output-available');
  // A tool can only still be running while the answer is arriving.
  const running = isStreaming ? tools.filter(({ part }) => !isFinished(part.state)) : [];
  const text = textOf(message);
  const hasText = text.trim().length > 0;
  const lastPart = parts[parts.length - 1];
  // The tool has answered and the model is writing: that is real waiting, so it says so.
  const waitingForWords =
    isStreaming &&
    !hasText &&
    running.length === 0 &&
    !!lastPart &&
    lastPart.type !== 'text' &&
    tools.length > 0;

  return (
    <article className="msg answer fade-in" aria-label="Answer">
      {tools.map(({ part, name }) => {
        const label = TOOL_LABELS[name];
        if (part.state === 'output-available') {
          return (
            <p key={part.toolCallId} className="tool-step">
              {label.done}
            </p>
          );
        }
        if (part.state === 'output-error' || part.state === 'output-denied') {
          return (
            <p key={part.toolCallId} className="tool-step">
              Couldn’t load {label.source}
            </p>
          );
        }
        return isStreaming ? (
          <p key={part.toolCallId} className="tool-step">
            <span className="shimmer">{label.running}</span>
          </p>
        ) : null;
      })}

      {done.length > 0
        ? renderAnswerCard(done[0].name)
        : running.length > 0 && <CardPlaceholder />}

      {waitingForWords && <Thinking />}

      {hasText && <ChatMessageContent message={message} streaming={isStreaming} />}

      {!isStreaming && (
        <div className="answer__foot">
          {done.length > 0 && (
            <p className="based-on">
              Based on:{' '}
              {done.map(({ part, name }, i) => (
                <span key={part.toolCallId}>
                  {i > 0 && ', '}
                  <button
                    type="button"
                    onClick={(e) => open(name, e.currentTarget)}
                    className="based-on__link"
                  >
                    {TOOL_LABELS[name].source}
                  </button>
                </span>
              ))}
            </p>
          )}
          <MessageActions
            getText={() => text}
            canCopy={hasText}
            onRemove={onRemove}
            removeLabel="Remove this answer from the conversation"
            label={stopped ? 'Stopped' : 'Live'}
            labelTitle={stopped ? undefined : 'Generated live by the AI model'}
          />
          {footer}
        </div>
      )}
    </article>
  );
}
