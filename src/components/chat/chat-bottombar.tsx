'use client';

import { ChatRequestOptions } from 'ai';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, CornerDownLeft, Square } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Command } from '@/lib/commands';

interface ChatBottombarProps {
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  isLoading: boolean;
  stop: () => void;
  input: string;
  isToolInProgress: boolean;
  commands: Command[];
  onRunCommand: (command: Command) => void;
  onOpenCommand: () => void;
}

// Rotating example questions shown as ghost text in the empty composer. They
// double as inline autocomplete suggestions: press Tab (or tap the hint) to
// drop the current one into the field — the Gmail / Copilot "ghost text"
// pattern — so visitors discover the composer answers free-form questions live.
const EXAMPLES = [
  'How did you make AIVI multi-tenant on Supabase?',
  'How do multi-region cells route requests?',
  'Could you get my product ready for SOC 2?',
  'How does the voice agent drive a co-browsing widget?',
  'Why should I hire you over another senior engineer?',
];

const MAX_TEXTAREA_HEIGHT = 160; // ~6 lines

const EASE = [0.22, 1, 0.36, 1] as const;

const KIND_LABEL: Record<Command['kind'], string> = {
  ask: 'Ask',
  link: 'Open',
  copy: 'Copy',
  resume: 'File',
  theme: 'Toggle',
  hire: 'Hire',
};

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  isToolInProgress,
  commands,
  onRunCommand,
  onOpenCommand,
}: ChatBottombarProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [active, setActive] = useState(0);
  const [exampleIdx, setExampleIdx] = useState(0);

  const currentExample = EXAMPLES[exampleIdx];

  const isSlash = input.startsWith('/');
  const slashMatches = useMemo(() => {
    if (!isSlash) return [];
    const q = input.slice(1).toLowerCase();
    // Rank: exact slash, then slash prefix, then keyword / label — so `/hire`
    // + Enter runs /hire, not the first command that merely mentions hiring.
    const rank = (c: Command) => {
      const s = c.slash!.slice(1).toLowerCase();
      if (s === q) return 0;
      if (s.startsWith(q)) return 1;
      if (c.keywords.some((k) => k.toLowerCase().startsWith(q))) return 2;
      if (c.label.toLowerCase().includes(q)) return 3;
      return -1;
    };
    return commands
      .filter((c) => c.slash && rank(c) >= 0)
      .sort((a, b) => rank(a) - rank(b))
      .slice(0, 7);
  }, [isSlash, input, commands]);

  const showSlash = isSlash && slashMatches.length > 0;

  // A suggestion is offered only while the field is empty and idle — so Tab is
  // never intercepted mid-typing, and the ghost text can't be mistaken for
  // something the user actually entered.
  const suggestionActive =
    input.length === 0 && !isToolInProgress && !showSlash;

  useEffect(() => setActive(0), [input]);

  // Auto-grow the textarea up to a max height, then scroll internally.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [input]);

  // Cycle the suggested example while the field is empty and idle.
  useEffect(() => {
    if (!suggestionActive) return;
    const id = setInterval(
      () => setExampleIdx((i) => (i + 1) % EXAMPLES.length),
      4200
    );
    return () => clearInterval(id);
  }, [suggestionActive]);

  // Drop the current suggestion into the field, ready to edit or send.
  const acceptSuggestion = () => {
    handleInputChange({
      target: { value: currentExample },
    } as React.ChangeEvent<HTMLTextAreaElement>);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) {
        el.focus();
        const end = el.value.length;
        el.setSelectionRange(end, end);
      }
    });
  };

  const clearInput = () =>
    handleInputChange({
      target: { value: '' },
    } as React.ChangeEvent<HTMLTextAreaElement>);

  const runSlash = (cmd: Command) => {
    clearInput();
    onRunCommand(cmd);
  };

  const submit = () =>
    handleSubmit({
      preventDefault: () => {},
    } as unknown as React.FormEvent<HTMLFormElement>);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Accept the ghost suggestion with Tab or → (Right). Only while empty, and
    // never on Shift+Tab — keyboard users keep normal focus traversal.
    if (
      suggestionActive &&
      (e.key === 'Tab' || e.key === 'ArrowRight') &&
      !e.shiftKey &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.nativeEvent.isComposing
    ) {
      e.preventDefault();
      acceptSuggestion();
      return;
    }

    if (showSlash) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => (a + 1) % slashMatches.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => (a - 1 + slashMatches.length) % slashMatches.length);
        return;
      }
      if (
        (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) &&
        !e.nativeEvent.isComposing
      ) {
        e.preventDefault();
        runSlash(slashMatches[active]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        clearInput();
        return;
      }
    }

    // Enter submits; Shift+Enter inserts a newline.
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      !isToolInProgress &&
      input.trim()
    ) {
      e.preventDefault();
      submit();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const mode = isLoading
    ? { label: 'Streaming', tone: 'text-clay-ink' }
    : isToolInProgress
      ? { label: 'Running tool', tone: 'text-clay-ink' }
      : isSlash
        ? { label: 'Command', tone: 'text-foreground' }
        : { label: 'Live model', tone: 'text-muted-foreground' };

  const canSend = !!input.trim() && !isToolInProgress && !isSlash;

  return (
    <div className="relative w-full">
      {/* Slash-command menu */}
      <AnimatePresence>
        {showSlash && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: EASE }}
            style={{ transformOrigin: '50% 100%' }}
            className="absolute bottom-[calc(100%+8px)] left-0 z-30 w-full overflow-hidden rounded-lg border border-transparent bg-popover shadow-[var(--shadow-float)]"
          >
            <div className="flex items-center justify-between border-b border-border-subtle px-3.5 py-2">
              <span className="meta text-muted-foreground">Commands</span>
              <span className="meta hidden items-center gap-2 text-muted-foreground sm:flex">
                <span>↑↓ move</span>
                <span>↵ run</span>
                <span>esc clear</span>
              </span>
            </div>
            <ul
              id="slash-listbox"
              role="listbox"
              aria-label="Slash commands"
              className="p-1"
            >
              {slashMatches.map((cmd, i) => {
                const selected = i === active;
                return (
                  <li
                    key={cmd.id}
                    id={`slash-opt-${cmd.id}`}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => runSlash(cmd)}
                    className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-[16px] transition-colors duration-150 ${
                      selected
                        ? 'bg-secondary text-foreground shadow-[inset_2px_0_0_var(--clay)]'
                        : 'text-ink-soft'
                    }`}
                  >
                    <span className="num w-[5.5rem] shrink-0 text-[13px] text-clay-ink">
                      {cmd.slash}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{cmd.label}</span>
                    {cmd.hint && (
                      <span className="hidden max-w-[11rem] shrink-0 truncate text-[13px] text-muted-foreground sm:block">
                        {cmd.hint}
                      </span>
                    )}
                    <span className="meta w-10 shrink-0 text-right text-muted-foreground">
                      {selected ? (
                        <CornerDownLeft className="ml-auto h-3.5 w-3.5" />
                      ) : (
                        KIND_LABEL[cmd.kind]
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="border border-input bg-card transition-[border-color,box-shadow] duration-200 focus-within:border-clay">
          {/* Input row */}
          <div className="relative flex items-start gap-2.5 px-4 pt-3.5 pb-2">
            <span
              aria-hidden
              className="num select-none pt-[3px] text-[16px] leading-6 text-clay"
            >
              ›
            </span>
            <div className="relative min-w-0 flex-1">
              {/* Ghost suggestion — an overlay so it never wraps the field */}
              {suggestionActive && (
                <span
                  key={exampleIdx}
                  aria-hidden
                  className="reveal pointer-events-none absolute inset-x-0 top-1 truncate text-[16px] leading-6 text-muted-foreground"
                >
                  {currentExample}
                </span>
              )}
              {input.length === 0 && isToolInProgress && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-1 text-[16px] leading-6 text-muted-foreground"
                >
                  One moment…
                </span>
              )}
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                aria-label="Ask a question, or type / for commands"
                aria-describedby="composer-hint"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={showSlash}
                aria-controls={showSlash ? 'slash-listbox' : undefined}
                aria-activedescendant={
                  showSlash
                    ? `slash-opt-${slashMatches[active]?.id}`
                    : undefined
                }
                className="scrollbar-subtle relative block max-h-40 w-full resize-none bg-transparent py-1 text-[16px] leading-6 text-foreground focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed"
                disabled={isToolInProgress}
              />
            </div>
          </div>

          {/* Instrument rail */}
          <div className="flex items-center justify-between gap-3 border-t border-border-subtle py-1.5 pr-1.5 pl-4">
            <div
              id="composer-hint"
              className="meta flex min-w-0 items-center gap-3 text-muted-foreground"
            >
              <span
                className={`flex shrink-0 items-center gap-1.5 ${mode.tone}`}
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${
                    isLoading || isToolInProgress
                      ? 'motion-safe:animate-pulse bg-clay'
                      : isSlash
                        ? 'bg-foreground'
                        : 'bg-success'
                  }`}
                />
                {mode.label}
              </span>
              <span
                aria-hidden
                className="hidden h-3 w-px bg-border sm:block"
              />
              <span className="hidden truncate normal-case tracking-normal sm:inline">
                <span className="text-foreground">/</span> commands
              </span>
              {suggestionActive && (
                <button
                  type="button"
                  onClick={acceptSuggestion}
                  aria-label={`Use example question: ${currentExample}`}
                  className="press flex shrink-0 items-center gap-1 rounded-sm normal-case tracking-normal hover:text-foreground"
                >
                  <kbd className="kbd">Tab</kbd>
                  <span className="hidden sm:inline">use example</span>
                  <span className="sm:hidden">example</span>
                </button>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenCommand}
                aria-label="Open command menu"
                className="press hidden h-8 items-center rounded-md px-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground sm:flex"
              >
                <kbd className="kbd">⌘K</kbd>
              </button>

              {isLoading ? (
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Stop generating"
                  className="btn-ink h-8 px-3 text-[13px]"
                >
                  <Square className="h-3 w-3 fill-current" />
                  <span className="hidden sm:inline">Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSend}
                  aria-label="Send"
                  className="btn-ink h-8 px-3 text-[13px] disabled:pointer-events-none disabled:bg-secondary disabled:text-muted-foreground"
                >
                  <span className="hidden sm:inline">Send</span>
                  <ArrowUp className="h-3.5 w-3.5 sm:hidden" />
                  <CornerDownLeft className="hidden h-3.5 w-3.5 sm:block" />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
