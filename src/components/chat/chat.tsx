'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, isToolUIPart, type UIMessage } from 'ai';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';

import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import { AssistantTurn } from '@/components/chat/simple-chat-view';
import { PresetReply } from '@/components/chat/preset-reply';
import { CommandPalette } from '@/components/chat/command-palette';
import { TopBar } from '@/components/chat/top-bar';
import { HireSheet } from '@/components/chat/hire-sheet';
import HelperBoost from './HelperBoost';
import { TurnHeader } from './turn-badge';
import { presetReplies, getConfig } from '@/lib/config-loader';
import { buildCommands, type Command } from '@/lib/commands';
import { onAsk, onHire } from '@/lib/portfolio-events';

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
  const [hireOpen, setHireOpen] = useState(false);
  const [input, setInput] = useState('');
  const [heroComposerVisible, setHeroComposerVisible] = useState(true);
  const [presetItems, setPresetItems] = useState<PresetItem[]>([]);
  const [errorItem, setErrorItem] = useState<ErrorItem | null>(null);

  // Monotonic tie-break for entries sharing an anchor. Only ever touched inside
  // event handlers / callbacks, never during render.
  const orderRef = useRef(0);
  const nextOrder = () => orderRef.current++;

  const bottomRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { messages, status, stop, regenerate, sendMessage, setMessages } =
    useChat({
      transport: new DefaultChatTransport({ api: '/api/chat' }),
      onFinish: () => setLoadingSubmit(false),
      onError: (error) => {
        setLoadingSubmit(false);
        console.error('Chat error:', error.message);
        setErrorItem({
          anchor: messagesRef.current.length,
          order: nextOrder(),
        });
        if (!(
          error.message?.includes('quota') ||
          error.message?.includes('exceeded') ||
          error.message?.includes('429') ||
          error.message?.includes('API key')
        )) {
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
    bottomRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'end',
    });
  }, [timeline.length, loadingSubmit, reduceMotion]);
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
        case 'hire':
          setHireOpen(true);
          break;
      }
    },
    [submitQuery, config.resume.downloadUrl, setTheme, resolvedTheme]
  );

  // Cards and landing sections ask questions / open the hire sheet via events.
  useEffect(
    () =>
      onAsk(({ question, live }) =>
        live ? submitQueryToAI(question) : submitQuery(question)
      ),
    [submitQuery, submitQueryToAI]
  );
  useEffect(() => onHire(() => setHireOpen(true)), []);

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

  const composerProps = {
    input,
    handleInputChange,
    handleSubmit: onSubmit,
    isLoading,
    stop: handleStop,
    isToolInProgress,
    commands,
    onRunCommand: runCommand,
    onOpenCommand: () => setPaletteOpen(true),
  };

  return (
    <MotionConfig reducedMotion="user">
      <CommandPalette
        commands={commands}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onRun={runCommand}
      />

      <HireSheet open={hireOpen} onClose={() => setHireOpen(false)} />

      {isEmptyState ? (
        <>
          <TopBar
            onOpenCommand={() => setPaletteOpen(true)}
            onHome={goHome}
            onHire={() => setHireOpen(true)}
          />
          <ChatLanding
            submitQuery={submitQuery}
            handlePresetReply={handlePresetReply}
            onOpenCommand={() => setPaletteOpen(true)}
            onHire={() => setHireOpen(true)}
            commands={commands}
            onComposerVisible={setHeroComposerVisible}
            composer={
              <ChatBottombar
                {...composerProps}
                variant="window"
                menuEnabled={heroComposerVisible}
                focusOnMount
              />
            }
          />
          {/* Once the hero scrolls off, the twin stays one tap away. */}
          {!heroComposerVisible && (
            <div className="dock">
              <div className="wrap">
                <ChatBottombar {...composerProps} variant="dock" />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex h-dvh flex-col overflow-hidden bg-background">
          <TopBar
            conversation
            onOpenCommand={() => setPaletteOpen(true)}
            onHome={goHome}
            onHire={() => setHireOpen(true)}
          />

          <main className="wrap flex min-h-0 flex-1 gap-10">
            {/* Who you are talking to, always in view on a desktop */}
            <aside
              aria-label="About this twin"
              className="scrollbar-subtle hidden w-[320px] shrink-0 flex-col gap-6 overflow-y-auto py-8 lg:flex"
            >
              <div className="flex items-center gap-3">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                  <Image src={config.personal.avatar} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[18px] leading-tight font-medium">
                    {config.personal.shortName}&apos;s AI twin
                  </span>
                  <span className="text-[14px] text-muted-foreground">Answers as me</span>
                </span>
              </div>
              {config.availability.open && (
                <p className="flex gap-2 text-[14px] leading-snug text-ink-soft">
                  <span className="status-dot mt-1.5" aria-hidden />
                  {config.availability.headline}
                </p>
              )}
              <div>
                <p className="mb-3 text-[14px] font-medium text-muted-foreground">Ask about</p>
                <HelperBoost
                  variant="rail"
                  submitQuery={submitQuery}
                  handlePresetReply={handlePresetReply}
                  commands={commands}
                />
              </div>
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="scrollbar-subtle min-h-0 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-8 pt-6 pb-8 sm:gap-10 sm:pt-8 lg:pr-4">
                  <AnimatePresence initial={false}>
                    {timeline.map((entry) => {
                      if (entry.kind === 'error') {
                        return (
                          <QuotaNotice
                            key={entry.key}
                            onQuick={() => {
                              setErrorItem(null);
                              const preset =
                                presetReplies['How can I reach you?'];
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
                          <motion.div
                            key={entry.key}
                            className="flex flex-col gap-5"
                            initial={false}
                            exit={{
                              opacity: 0,
                              y: -4,
                              transition: { duration: 0.15 },
                            }}
                          >
                            <UserBubble text={p.question} />
                            <PresetReply
                              question={p.question}
                              reply={p.reply}
                              tool={p.tool}
                              canEscalate={p.id === latestPresetId}
                              onGetAIResponse={(q) => {
                                // Escalating replaces the instant card with the
                                // live answer. Otherwise the AI re-renders the same
                                // tool card and shows it twice.
                                removePreset(p.id);
                                handleGetAIResponse(q);
                              }}
                              onClose={() => removePreset(p.id)}
                            />
                          </motion.div>
                        );
                      }

                      // Chat message
                      const m = entry.message;
                      if (m.role === 'user') {
                        const text = (m.parts ?? [])
                          .filter((part) => part.type === 'text')
                          .map((part) =>
                            part.type === 'text' ? part.text : ''
                          )
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
                  </AnimatePresence>

                  {loadingSubmit && (
                    <div className="reveal flex flex-col gap-2" role="status">
                      <TurnHeader kind="ai" />
                      <div className="flex items-center gap-2.5 py-1">
                        <span className="composing flex items-center gap-1" aria-hidden>
                          <span />
                          <span />
                          <span />
                        </span>
                        <span className="text-[14px] text-muted-foreground">Thinking</span>
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} className="h-px w-full" />
                </div>
              </div>

              {/* Composer */}
              <div className="relative z-30 shrink-0 bg-background pb-[env(safe-area-inset-bottom)] lg:pr-4">
                <div className="flex flex-col gap-2 pt-2 pb-2">
                  <div className="hidden sm:block lg:hidden">
                    <HelperBoost
                      submitQuery={submitQuery}
                      handlePresetReply={handlePresetReply}
                      commands={commands}
                    />
                  </div>
                  <ChatBottombar {...composerProps} variant="shell" focusOnMount />
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </MotionConfig>
  );
};

function UserBubble({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <div className="reveal flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-[16px] leading-relaxed break-words whitespace-pre-wrap text-brand-foreground lg:max-w-[70%]">
        <span className="sr-only">You asked: </span>
        {text}
      </p>
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
    <div className="reveal" role="alert">
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-2.5">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-warning" />
          <span className="meta text-muted-foreground">
            Live answers paused
          </span>
        </div>
        <div className="px-5 py-4">
          <h3 className="font-display text-[1.25rem] leading-tight text-foreground">
            Live answers are paused for a moment
          </h3>
          <p className="measure mt-1.5 text-[14px] leading-relaxed text-ink-soft">
            The AI model hit its rate limit. Everything else still works: the
            instant answers and the search menu are pre-written and need no AI call.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={onQuick} className="btn btn--primary">
              How to reach me
            </button>
            <button
              onClick={onCommand}
              className="btn btn--secondary"
            >
              Open the search menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
