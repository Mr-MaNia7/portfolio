'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isToolUIPart, type UIMessage } from 'ai';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import { AssistantTurn } from '@/components/chat/simple-chat-view';
import { PresetReply } from '@/components/chat/preset-reply';
import { CommandPalette } from '@/components/chat/command-palette';
import { TopBar } from '@/components/chat/top-bar';
import HelperBoost from './HelperBoost';
import { ChatBubble, ChatBubbleMessage } from '@/components/ui/chat/chat-bubble';
import { TurnBadge } from './turn-badge';
import { presetReplies, getConfig } from '@/lib/config-loader';
import { buildCommands, type Command } from '@/lib/commands';

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 16 },
  transition: { duration: 0.28, ease: 'easeOut' },
} as const;

type PresetItem = {
  id: string;
  // # of chat messages that existed when this was created — used to interleave
  // instant preset answers with the AI conversation chronologically.
  anchor: number;
  order: number;
  question: string;
  reply: string;
  tool: string;
};

type ErrorItem = { anchor: number; order: number };

// A single entry in the rendered transcript.
type TimelineItem =
  | { key: string; kind: 'msg'; message: UIMessage }
  | { key: string; kind: 'preset'; item: PresetItem }
  | { key: string; kind: 'error' };

const Chat = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');
  const { setTheme, resolvedTheme } = useTheme();

  const config = useMemo(() => getConfig(), []);
  const commands = useMemo(() => buildCommands(config), [config]);

  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [input, setInput] = useState('');
  const [presetItems, setPresetItems] = useState<PresetItem[]>([]);
  const [errorItem, setErrorItem] = useState<ErrorItem | null>(null);

  // Monotonic tie-break for entries sharing an anchor. Only ever touched inside
  // event handlers / callbacks, never during render.
  const orderRef = useRef(0);
  const nextOrder = () => orderRef.current++;

  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, status, stop, regenerate, sendMessage, setMessages } =
    useChat({
      transport: new DefaultChatTransport({ api: '/api/chat' }),
      onFinish: () => setLoadingSubmit(false),
      onError: (error) => {
        setLoadingSubmit(false);
        console.error('Chat error:', error.message);
        setErrorItem({ anchor: messagesRef.current.length, order: nextOrder() });
        if (
          !(
            error.message?.includes('quota') ||
            error.message?.includes('exceeded') ||
            error.message?.includes('429') ||
            error.message?.includes('API key')
          )
        ) {
          toast.error('Something went wrong. Try a quick question below.');
        }
      },
    });

  // Latest messages, readable from event handlers without re-creating callbacks.
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const isLoading = status === 'submitted' || status === 'streaming';
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setInput(e.target.value);

  // Hide the standalone loading bubble once the response starts streaming.
  useEffect(() => {
    if (status === 'streaming') setLoadingSubmit(false);
  }, [status]);

  const isToolInProgress = messages.some(
    (m) =>
      m.role === 'assistant' &&
      m.parts?.some(
        (part) => isToolUIPart(part) && part.state !== 'output-available'
      )
  );

  // Merge messages + presets + error into one ordered transcript. A preset (or
  // the error notice) anchored at N renders right after the Nth chat message,
  // so instant answers and AI turns stay in the order they happened.
  const timeline = useMemo<TimelineItem[]>(() => {
    const extras: Array<{ anchor: number; order: number; node: TimelineItem }> =
      [];
    for (const p of presetItems) {
      extras.push({
        anchor: p.anchor,
        order: p.order,
        node: { key: `preset-${p.id}`, kind: 'preset', item: p },
      });
    }
    if (errorItem) {
      extras.push({
        anchor: errorItem.anchor,
        order: errorItem.order,
        node: { key: 'error', kind: 'error' },
      });
    }
    extras.sort((a, b) => a.order - b.order);

    const items: TimelineItem[] = [];
    for (let i = 0; i <= messages.length; i++) {
      for (const e of extras) if (e.anchor === i) items.push(e.node);
      if (i < messages.length) {
        const m = messages[i];
        items.push({ key: `msg-${m.id}`, kind: 'msg', message: m });
      }
    }
    return items;
  }, [messages, presetItems, errorItem]);

  const isEmptyState = timeline.length === 0 && !loadingSubmit;

  // Only the most recent turn — when it's a preset and nothing is loading after
  // it — offers "Ask the live AI". Older presets are settled history.
  const lastEntry = timeline[timeline.length - 1];
  const latestPresetId =
    !loadingSubmit && lastEntry?.kind === 'preset' ? lastEntry.item.id : null;

  // Keep the newest turn in view (new turns and while streaming).
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [timeline.length, loadingSubmit]);
  useEffect(() => {
    if (status === 'streaming') {
      bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  }, [messages, status]);

  const addPreset = useCallback(
    (question: string, reply: string, tool: string) => {
      setErrorItem(null);
      setPresetItems((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${prev.length}`,
          anchor: messagesRef.current.length,
          order: nextOrder(),
          question,
          reply,
          tool,
        },
      ]);
      setLoadingSubmit(false);
    },
    []
  );

  const submitQuery = useCallback(
    (query: string) => {
      if (!query.trim() || isToolInProgress) return;
      setErrorItem(null);
      if (presetReplies[query]) {
        const preset = presetReplies[query];
        addPreset(query, preset.reply, preset.tool);
        return;
      }
      setLoadingSubmit(true);
      sendMessage({ text: query });
    },
    [sendMessage, isToolInProgress, addPreset]
  );

  const submitQueryToAI = useCallback(
    (query: string) => {
      if (!query.trim() || isToolInProgress) return;
      setErrorItem(null);
      setLoadingSubmit(true);
      sendMessage({ text: query });
    },
    [sendMessage, isToolInProgress]
  );

  const handlePresetReply = useCallback(
    (question: string, reply: string, tool: string) => {
      addPreset(question, reply, tool);
    },
    [addPreset]
  );

  const handleGetAIResponse = useCallback(
    (question: string) => {
      submitQueryToAI(question);
    },
    [submitQueryToAI]
  );

  // Reset the ephemeral conversation in place — no full-page reload.
  const goHome = useCallback(() => {
    stop();
    setMessages([]);
    setPresetItems([]);
    setErrorItem(null);
    orderRef.current = 0;
    setLoadingSubmit(false);
    setInput('');
    window.history.replaceState(null, '', '/');
  }, [stop, setMessages]);

  const runCommand = useCallback(
    (cmd: Command) => {
      setPaletteOpen(false);
      switch (cmd.kind) {
        case 'ask':
          submitQuery(cmd.payload || cmd.label);
          break;
        case 'link':
          if (cmd.payload) window.open(cmd.payload, '_blank', 'noopener');
          break;
        case 'copy':
          if (cmd.payload) {
            navigator.clipboard
              ?.writeText(cmd.payload)
              .then(() => toast.success(`Copied ${cmd.payload}`))
              .catch(() => toast.error('Could not copy'));
          }
          break;
        case 'resume':
          window.open(config.resume.downloadUrl, '_blank', 'noopener');
          break;
        case 'theme':
          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
          break;
      }
    },
    [submitQuery, config.resume.downloadUrl, setTheme, resolvedTheme]
  );

  // ⌘K / Ctrl+K to open the command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (initialQuery && !autoSubmitted) {
      setAutoSubmitted(true);
      setInput('');
      submitQuery(initialQuery);
    }
  }, [initialQuery, autoSubmitted, submitQuery]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isToolInProgress) return;
    submitQueryToAI(input);
    setInput('');
  };

  const handleStop = () => {
    stop();
    setLoadingSubmit(false);
  };

  const removePreset = (id: string) =>
    setPresetItems((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="relative flex h-svh flex-col overflow-hidden bg-background">
      <CommandPalette
        commands={commands}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onRun={runCommand}
      />

      <TopBar onOpenCommand={() => setPaletteOpen(true)} onHome={goHome} />

      {/* Scrollable content */}
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4">
          <AnimatePresence mode="wait">
            {isEmptyState ? (
              <motion.div
                key="landing"
                className="flex min-h-full flex-1 items-center justify-center py-8"
                {...MOTION_CONFIG}
                initial={false}
              >
                <ChatLanding
                  submitQuery={submitQuery}
                  handlePresetReply={handlePresetReply}
                  onOpenCommand={() => setPaletteOpen(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="conversation"
                className="flex flex-col gap-4 py-6"
                {...MOTION_CONFIG}
                initial={false}
              >
                {timeline.map((entry) => {
                  if (entry.kind === 'error') {
                    return (
                      <QuotaNotice
                        key={entry.key}
                        onQuick={() => {
                          setErrorItem(null);
                          const preset = presetReplies['How can I reach you?'];
                          if (preset)
                            addPreset(
                              'How can I reach you?',
                              preset.reply,
                              preset.tool
                            );
                        }}
                        onCommand={() => {
                          setErrorItem(null);
                          setPaletteOpen(true);
                        }}
                      />
                    );
                  }

                  if (entry.kind === 'preset') {
                    const p = entry.item;
                    return (
                      <div key={entry.key} className="flex flex-col gap-3">
                        <UserBubble text={p.question} />
                        <PresetReply
                          question={p.question}
                          reply={p.reply}
                          tool={p.tool}
                          canEscalate={p.id === latestPresetId}
                          onGetAIResponse={(q) => {
                            // Escalating replaces the instant card with the
                            // live answer — otherwise the AI re-renders the same
                            // tool card (and echoes the question), showing it
                            // twice.
                            removePreset(p.id);
                            handleGetAIResponse(q);
                          }}
                          onClose={() => removePreset(p.id)}
                        />
                      </div>
                    );
                  }

                  // Chat message
                  const m = entry.message;
                  if (m.role === 'user') {
                    const text = (m.parts ?? [])
                      .filter((part) => part.type === 'text')
                      .map((part) => (part.type === 'text' ? part.text : ''))
                      .join('');
                    return <UserBubble key={entry.key} text={text} />;
                  }
                  return (
                    <AssistantTurn
                      key={entry.key}
                      message={m}
                      isLoading={isLoading}
                      reload={regenerate}
                    />
                  );
                })}

                {loadingSubmit && (
                  <div className="flex flex-col">
                    <div className="mb-2">
                      <TurnBadge kind="ai" />
                    </div>
                    <ChatBubble variant="received">
                      <ChatBubbleMessage isLoading />
                    </ChatBubble>
                  </div>
                )}

                <div ref={bottomRef} className="h-px w-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto w-full max-w-3xl px-4 pt-3 pb-4">
          <div className="flex flex-col items-center gap-3">
            <HelperBoost
              submitQuery={submitQuery}
              handlePresetReply={handlePresetReply}
            />
            <ChatBottombar
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={onSubmit}
              isLoading={isLoading}
              stop={handleStop}
              isToolInProgress={isToolInProgress}
              commands={commands}
              onRunCommand={runCommand}
              onOpenCommand={() => setPaletteOpen(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function UserBubble({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <div className="flex justify-end">
      <ChatBubble variant="sent">
        <ChatBubbleMessage>{text}</ChatBubbleMessage>
      </ChatBubble>
    </div>
  );
}

function QuotaNotice({
  onQuick,
  onCommand,
}: {
  onQuick: () => void;
  onCommand: () => void;
}) {
  return (
    <motion.div {...MOTION_CONFIG} initial={false} className="py-2">
      <div className="rounded-lg border border-border bg-secondary/60 p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="status-dot" style={{ opacity: 0.9 }} />
          <h3 className="text-sm font-semibold text-foreground">
            The live model is resting
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Free-form AI answers are momentarily unavailable (rate limits on the
          hosted model). Everything else still works instantly — the quick
          questions and the ⌘K menu answer from curated content with no API call.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onQuick} className="btn-claude h-9 px-4 text-sm">
            How to reach me
          </button>
          <button
            onClick={onCommand}
            className="rounded-sm border border-border-strong px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
          >
            Open ⌘K menu
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default Chat;
