'use client';

import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  type ChatOnErrorCallback,
  type ChatOnFinishCallback,
  type ChatStatus,
  type UIMessage,
} from 'ai';
import { useEffect, type RefObject } from 'react';

export type LiveChatApi = Pick<
  UseChatHelpers<UIMessage>,
  'sendMessage' | 'stop' | 'regenerate' | 'setMessages'
>;
export type LiveChatState = { messages: UIMessage[]; status: ChatStatus };
export type LiveChatCallbacks = {
  onFinish: ChatOnFinishCallback<UIMessage>;
  onError: ChatOnErrorCallback;
};

/** One transport for the page's life: it holds no per-render state. */
const transport = new DefaultChatTransport({ api: '/api/chat' });

/**
 * The connection to the live model. It renders nothing: it owns useChat and
 * reports what it holds to the chat. Loaded on its own, after the landing page,
 * because the AI SDK and its stream schemas are the heaviest code on the page.
 */
export default function LiveChatEngine({
  initialMessages,
  callbacks,
  onReady,
  onState,
}: {
  /** What the chat already shows, so the engine starts from the same conversation. */
  initialMessages: UIMessage[];
  callbacks: RefObject<LiveChatCallbacks>;
  onReady: (api: LiveChatApi) => void;
  onState: (state: LiveChatState) => void;
}) {
  const { messages, status, sendMessage, stop, regenerate, setMessages } = useChat({
    transport,
    messages: initialMessages,
    // Words arrive evenly from the server; rendering them in small batches keeps the page calm.
    throttle: 40,
    onFinish: (event) => callbacks.current.onFinish(event),
    onError: (error) => callbacks.current.onError(error),
  });

  // Ready first, so anything asked before loading runs before the first report.
  useEffect(() => {
    onReady({ sendMessage, stop, regenerate, setMessages });
  }, [onReady, sendMessage, stop, regenerate, setMessages]);

  useEffect(() => {
    onState({ messages, status });
  }, [onState, messages, status]);

  return null;
}
