'use client';
import { useChat } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import ChatMessageContent from '@/components/chat/chat-message-content';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';
import { PresetReply } from '@/components/chat/preset-reply';
import { CommandPalette } from '@/components/chat/command-palette';
import { TopBar } from '@/components/chat/top-bar';
import HelperBoost from './HelperBoost';
import { ChatBubble, ChatBubbleMessage } from '@/components/ui/chat/chat-bubble';
import { presetReplies, getConfig } from '@/lib/config-loader';
import { buildCommands, type Command } from '@/lib/commands';

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 16 },
  transition: { duration: 0.28, ease: 'easeOut' },
};

const Chat = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');
  const { setTheme, resolvedTheme } = useTheme();

  const config = useMemo(() => getConfig(), []);
  const commands = useMemo(() => buildCommands(config), [config]);

  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [presetReply, setPresetReply] = useState<{
    question: string;
    reply: string;
    tool: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    isLoading,
    stop,
    setInput,
    reload,
    addToolResult,
    append,
  } = useChat({
    onResponse: (response) => {
      if (response) setLoadingSubmit(false);
    },
    onFinish: () => setLoadingSubmit(false),
    onError: (error) => {
      setLoadingSubmit(false);
      console.error('Chat error:', error.message);
      const quota =
        error.message?.includes('quota') ||
        error.message?.includes('exceeded') ||
        error.message?.includes('429') ||
        error.message?.includes('API key');
      if (quota) {
        setErrorMessage('quota_exhausted');
      } else {
        toast.error('Something went wrong. Try a quick question below.');
        setErrorMessage('quota_exhausted');
      }
    },
  });

  const { currentAIMessage, latestUserMessage, hasActiveTool } = useMemo(() => {
    const latestAIMessageIndex = messages.findLastIndex(
      (m) => m.role === 'assistant'
    );
    const latestUserMessageIndex = messages.findLastIndex(
      (m) => m.role === 'user'
    );

    const result = {
      currentAIMessage:
        latestAIMessageIndex !== -1 ? messages[latestAIMessageIndex] : null,
      latestUserMessage:
        latestUserMessageIndex !== -1 ? messages[latestUserMessageIndex] : null,
      hasActiveTool: false,
    };

    if (result.currentAIMessage) {
      result.hasActiveTool =
        result.currentAIMessage.parts?.some(
          (part) =>
            part.type === 'tool-invocation' &&
            part.toolInvocation?.state === 'result'
        ) || false;
    }

    if (latestAIMessageIndex < latestUserMessageIndex) {
      result.currentAIMessage = null;
    }

    return result;
  }, [messages]);

  const isToolInProgress = messages.some(
    (m) =>
      m.role === 'assistant' &&
      m.parts?.some(
        (part) =>
          part.type === 'tool-invocation' &&
          part.toolInvocation?.state !== 'result'
      )
  );

  const submitQuery = useCallback(
    (query: string) => {
      if (!query.trim() || isToolInProgress) return;
      setErrorMessage(null);
      if (presetReplies[query]) {
        const preset = presetReplies[query];
        setPresetReply({ question: query, reply: preset.reply, tool: preset.tool });
        setLoadingSubmit(false);
        return;
      }
      setLoadingSubmit(true);
      setPresetReply(null);
      append({ role: 'user', content: query });
    },
    [append, isToolInProgress]
  );

  const submitQueryToAI = useCallback(
    (query: string) => {
      if (!query.trim() || isToolInProgress) return;
      setErrorMessage(null);
      setLoadingSubmit(true);
      setPresetReply(null);
      append({ role: 'user', content: query });
    },
    [append, isToolInProgress]
  );

  const handlePresetReply = useCallback(
    (question: string, reply: string, tool: string) => {
      setErrorMessage(null);
      setPresetReply({ question, reply, tool });
      setLoadingSubmit(false);
    },
    []
  );

  const handleGetAIResponse = useCallback(
    (question: string) => {
      setPresetReply(null);
      submitQueryToAI(question);
    },
    [submitQueryToAI]
  );

  const goHome = useCallback(() => {
    setPresetReply(null);
    setErrorMessage(null);
    setLoadingSubmit(false);
    setInput('');
    // Clear the ephemeral conversation without a full reload
    window.history.replaceState(null, '', '/');
    window.location.href = '/';
  }, [setInput]);

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
  }, [initialQuery, autoSubmitted, submitQuery, setInput]);

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

  const isEmptyState =
    !currentAIMessage &&
    !latestUserMessage &&
    !loadingSubmit &&
    !presetReply &&
    !errorMessage;

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
                className="flex flex-col gap-2 py-6"
                {...MOTION_CONFIG}
              >
                {/* Pending question */}
                {latestUserMessage && !currentAIMessage && !presetReply && (
                  <div className="flex justify-end">
                    <ChatBubble variant="sent">
                      <ChatBubbleMessage>
                        <ChatMessageContent
                          message={latestUserMessage}
                          isLast
                          isLoading={false}
                          reload={() => Promise.resolve(null)}
                        />
                      </ChatBubbleMessage>
                    </ChatBubble>
                  </div>
                )}

                {presetReply ? (
                  <PresetReply
                    question={presetReply.question}
                    reply={presetReply.reply}
                    tool={presetReply.tool}
                    onGetAIResponse={handleGetAIResponse}
                    onClose={() => setPresetReply(null)}
                  />
                ) : errorMessage ? (
                  <QuotaNotice
                    onQuick={() => {
                      setErrorMessage(null);
                      const preset = presetReplies['How can I reach you?'];
                      if (preset)
                        setPresetReply({
                          question: 'How can I reach you?',
                          reply: preset.reply,
                          tool: preset.tool,
                        });
                    }}
                    onCommand={() => {
                      setErrorMessage(null);
                      setPaletteOpen(true);
                    }}
                  />
                ) : currentAIMessage ? (
                  <SimplifiedChatView
                    message={currentAIMessage}
                    isLoading={isLoading}
                    reload={reload}
                    addToolResult={addToolResult}
                  />
                ) : (
                  loadingSubmit && (
                    <ChatBubble variant="received">
                      <ChatBubbleMessage isLoading />
                    </ChatBubble>
                  )
                )}
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

function QuotaNotice({
  onQuick,
  onCommand,
}: {
  onQuick: () => void;
  onCommand: () => void;
}) {
  return (
    <motion.div {...MOTION_CONFIG} className="py-2">
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
