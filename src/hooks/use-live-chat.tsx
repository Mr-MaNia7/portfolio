'use client';

import type { UIMessage } from 'ai';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  LiveChatApi,
  LiveChatCallbacks,
  LiveChatState,
} from '@/components/chat/live-chat-engine';
import { whenIdle } from '@/lib/idle';

const LiveChatEngine = dynamic(() => import('@/components/chat/live-chat-engine'), {
  ssr: false,
});

type Pending =
  | { kind: 'send'; text: string }
  | { kind: 'regenerate' }
  | { kind: 'set'; messages: UIMessage[] };

/**
 * useChat, without the AI SDK in the landing page's first load. The engine that
 * holds useChat loads once the browser is idle, or at once if the visitor asks
 * first. Until then, what they ask waits in a queue and runs when it arrives.
 */
export function useLiveChat(callbacks: LiveChatCallbacks) {
  const [state, setState] = useState<LiveChatState>({ messages: [], status: 'ready' });
  const [wanted, setWanted] = useState(false);
  const apiRef = useRef<LiveChatApi | null>(null);
  const queueRef = useRef<Pending[]>([]);
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => whenIdle(() => setWanted(true), 1500), []);

  const run = useCallback((api: LiveChatApi, op: Pending) => {
    if (op.kind === 'send') void api.sendMessage({ text: op.text });
    else if (op.kind === 'regenerate') void api.regenerate();
    else api.setMessages(op.messages);
  }, []);

  const perform = useCallback(
    (op: Pending) => {
      if (apiRef.current) {
        run(apiRef.current, op);
        return;
      }
      queueRef.current.push(op);
      setWanted(true);
    },
    [run]
  );

  const onReady = useCallback(
    (api: LiveChatApi) => {
      apiRef.current = api;
      const pending = queueRef.current;
      queueRef.current = [];
      for (const op of pending) run(api, op);
    },
    [run]
  );

  const sendMessage = useCallback(
    ({ text }: { text: string }) => perform({ kind: 'send', text }),
    [perform]
  );
  const regenerate = useCallback(() => perform({ kind: 'regenerate' }), [perform]);

  const stop = useCallback(() => {
    if (apiRef.current) {
      void apiRef.current.stop();
      return;
    }
    // Nothing has started yet: stopping cancels what was waiting to be sent.
    queueRef.current = queueRef.current.filter(
      (op) => op.kind !== 'send' && op.kind !== 'regenerate'
    );
  }, []);

  // Shown at once, and handed to the engine now or when it arrives.
  const setMessages = useCallback(
    (messages: UIMessage[]) => {
      setState((s) => ({ ...s, messages }));
      perform({ kind: 'set', messages });
    },
    [perform]
  );

  const engine = wanted ? (
    <LiveChatEngine
      initialMessages={state.messages}
      callbacks={callbacksRef}
      onReady={onReady}
      onState={setState}
    />
  ) : null;

  return {
    messages: state.messages,
    status: state.status,
    sendMessage,
    regenerate,
    stop,
    setMessages,
    engine,
  };
}
