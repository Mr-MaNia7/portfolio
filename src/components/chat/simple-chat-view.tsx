'use client';

import {
  ChatBubble,
  ChatBubbleMessage,
} from '@/components/ui/chat/chat-bubble';
import { getToolName, isToolUIPart, type UIMessage } from 'ai';
import { motion } from 'framer-motion';
import ChatMessageContent from './chat-message-content';
import ToolRenderer from './tool-renderer';
import { TurnBadge } from './turn-badge';

interface SimplifiedChatViewProps {
  message: UIMessage;
  isLoading: boolean;
  reload: () => void;
}

const MOTION_CONFIG = {
  // Enter animations don't fire reliably under this framer-motion + React
  // version, which left content stuck at the `initial` (opacity 0) state — so we
  // render directly at the resting state instead of animating in.
  initial: false,
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.3,
    ease: 'easeOut',
  },
} as const;

/**
 * Renders a single assistant turn inline (tools + text) so it can live inside a
 * scrollable transcript alongside every previous turn. Unlike the old
 * full-height single-turn view, this owns no scroll container and grows to its
 * content — the parent transcript scrolls.
 */
export function AssistantTurn({
  message,
  isLoading,
  reload,
  animate = true,
}: SimplifiedChatViewProps & { animate?: boolean }) {
  if (message.role !== 'assistant') return null;

  // Extract completed tool calls (v5 tool parts: type 'tool-<name>', state 'output-available')
  const toolInvocations = (message.parts ?? [])
    .filter((part) => isToolUIPart(part) && part.state === 'output-available')
    .map((part) => ({
      toolCallId: isToolUIPart(part) ? part.toolCallId : '',
      toolName: isToolUIPart(part) ? getToolName(part) : '',
      result: isToolUIPart(part) ? part.output : undefined,
    }));

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
  if (!hasTools && !showTextContent) return null;

  const Wrapper = animate ? motion.div : 'div';
  const wrapperProps = animate ? MOTION_CONFIG : {};

  return (
    <Wrapper {...wrapperProps} className="flex w-full flex-col">
      <div className="mb-2">
        <TurnBadge kind="ai" />
      </div>
      {hasTools && (
        <div className="mb-4 w-full">
          <ToolRenderer
            toolInvocations={currentTool}
            messageId={message.id || 'current-msg'}
          />
        </div>
      )}

      {showTextContent && (
        <ChatBubble variant="received" className="w-full">
          <ChatBubbleMessage className="w-full">
            <ChatMessageContent
              message={message}
              isLast={true}
              isLoading={isLoading}
              reload={reload}
              skipToolRendering={true}
            />
          </ChatBubbleMessage>
        </ChatBubble>
      )}
    </Wrapper>
  );
}

// Backwards-compatible alias — same inline turn renderer.
export function SimplifiedChatView(props: SimplifiedChatViewProps) {
  return <AssistantTurn {...props} />;
}
