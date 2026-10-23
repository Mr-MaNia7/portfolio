'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

import { renderToolArtifact } from './tool-renderer';
import { ToolPill, TurnHeader } from './turn-badge';

interface PresetReplyProps {
  question: string;
  reply: string;
  tool: string;
  onGetAIResponse: (question: string, tool: string) => void;
  onClose?: () => void;
  /** Only the most recent turn offers escalation to the live AI. */
  canEscalate?: boolean;
}

export function PresetReply({
  question,
  reply,
  tool,
  onGetAIResponse,
  onClose,
  canEscalate = true,
}: PresetReplyProps) {
  const [showAIOption, setShowAIOption] = useState(true);

  const handleGetAIResponse = () => {
    setShowAIOption(false);
    onGetAIResponse(question, tool);
  };

  const component = renderToolArtifact(tool);

  return (
    <article
      className="reveal flex w-full flex-col gap-3"
      aria-label="Instant answer"
    >
      {/* Provenance + remove-from-history */}
      <TurnHeader
        kind="instant"
        action={
          onClose && (
            <button
              onClick={onClose}
              aria-label="Remove this answer from the conversation"
              title="Remove from conversation"
              className="press flex h-7 items-center gap-1 rounded-md px-2 text-[12px] text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          )
        }
      />

      {component ? (
        <div className="flex w-full flex-col gap-2.5">
          <div>
            <ToolPill tool={tool} state="cached" />
          </div>
          {component}

          {showAIOption && canEscalate && (
            <div
              className="reveal flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-1"
              style={{ '--i': 4 } as React.CSSProperties}
            >
              <p className="text-[13px] text-muted-foreground">
                Curated answer, shown instantly. Want it in my own words?
              </p>
              <button
                onClick={handleGetAIResponse}
                className="btn-line h-8 px-3 text-[13px]"
              >
                <Sparkles className="h-3.5 w-3.5 text-clay" aria-hidden />
                Ask the live AI
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="measure rounded-lg border border-border bg-card p-5 text-[15px] leading-relaxed text-foreground">
          {reply}
        </div>
      )}
    </article>
  );
}
