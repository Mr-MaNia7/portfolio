'use client';

import { getToolName, isToolUIPart, type UIMessage } from 'ai';
import ChatMessageContent from './chat-message-content';
import ToolRenderer from './tool-renderer';
import { ToolPill, TurnHeader } from './turn-badge';

interface SimplifiedChatViewProps {
  message: UIMessage;
  isLoading: boolean;
  reload: () => void;
}

/**
 * Renders a single assistant turn inline (tools + text) so it can live inside a
 * scrollable transcript alongside every previous turn. It owns no scroll
 * container and grows to its content — the parent transcript scrolls.
 *
 * Entrance motion is CSS (`.reveal`), not framer-motion: enter animations
 * didn't fire reliably under this framer-motion + React version and left
 * content stuck at opacity 0.
 */
export function AssistantTurn({
  message,
  isLoading,
  reload,
}: SimplifiedChatViewProps) {
  if (message.role !== 'assistant') return null;

  const toolParts = (message.parts ?? []).filter(isToolUIPart);

  // Extract completed tool calls (v5 tool parts: type 'tool-<name>', state 'output-available')
  const toolInvocations = toolParts
    .filter((part) => part.state === 'output-available')
    .map((part) => ({
      toolCallId: part.toolCallId,
      toolName: getToolName(part),
      result: part.output,
    }));

  // A tool the model has called but whose result hasn't arrived yet.
  const pendingTool = toolParts.find(
    (part) =>
      part.state === 'input-streaming' || part.state === 'input-available'
  );

  // Only display the first tool (if any)
  const currentTool = toolInvocations.length > 0 ? [toolInvocations[0]] : [];

  // Concatenate the text parts into the message's visible text
  const textContent = (message.parts ?? [])
    .filter((part) => part.type === 'text')
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('');

  const hasTextContent = textContent.trim().length > 0;
  const hasTools = currentTool.length > 0;

  // If we have tools, minimize text content to avoid redundancy
  const showTextContent =
    hasTextContent && (!hasTools || textContent.trim().length > 50);

  // Nothing to show yet (assistant message created but no text/tools streamed).
  if (!hasTools && !showTextContent && !pendingTool) return null;

  return (
    <article className="reveal flex w-full flex-col gap-3" aria-label="Answer">
      <TurnHeader kind="ai" />

      {pendingTool && !hasTools && (
        <div>
          <ToolPill tool={getToolName(pendingTool)} state="running" />
        </div>
      )}

      {hasTools && (
        <div className="flex w-full flex-col gap-2.5">
          <div>
            <ToolPill tool={currentTool[0].toolName} state="done" />
          </div>
          <ToolRenderer
            toolInvocations={currentTool}
            messageId={message.id || 'current-msg'}
          />
        </div>
      )}

      {showTextContent && (
        <div className={hasTools ? 'pt-2' : ''}>
          <ChatMessageContent
            message={message}
            isLast={true}
            isLoading={isLoading}
            reload={reload}
            skipToolRendering={true}
          />
        </div>
      )}
    </article>
  );
}

// Backwards-compatible alias — same inline turn renderer.
export function SimplifiedChatView(props: SimplifiedChatViewProps) {
  return <AssistantTurn {...props} />;
}
