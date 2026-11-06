'use client';

import { ChatRequestOptions } from 'ai';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, CornerDownLeft, Plus, Square } from 'lucide-react';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
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
  commands: Command[];
  onRunCommand: (command: Command) => void;
  onOpenCommand: () => void;
  /** window: inside the hero's chat window. shell: the conversation. dock: the compact bar under the hero. */
  variant?: 'window' | 'shell' | 'dock';
  /** Only one composer may show the slash menu at a time. */
  menuEnabled?: boolean;
  /** Take focus on mount. Pointer devices only, so a phone's keyboard never jumps open by itself. */
  focusOnMount?: boolean;
}

// Example questions. Tab (or the "Use an example" button) drops the next one
// into the empty field, so visitors discover it answers free-form questions.
const EXAMPLES = [
  'How would you make my SaaS multi-tenant without a rewrite?',
  'How would you run my product across multiple regions?',
  'Could you get my product ready for SOC 2?',
  'What would you do in your first two weeks on my product?',
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
  chat: 'Open',
};

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  commands,
  onRunCommand,
  onOpenCommand,
  variant = 'shell',
  menuEnabled = true,
  focusOnMount = false,
}: ChatBottombarProps) {
  const listId = useId();
  const hintId = useId();
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
  const suggestionActive = input.length === 0 && !isLoading && !showSlash;

  useEffect(() => setActive(0), [input]);

  // Auto-grow the textarea up to a max height, then scroll internally.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [input]);

  // Drop the current suggestion into the field, ready to edit or send.
  const acceptSuggestion = () => {
    handleInputChange({
      target: { value: currentExample },
    } as React.ChangeEvent<HTMLTextAreaElement>);
    setExampleIdx((i) => (i + 1) % EXAMPLES.length);
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

    // Enter submits; Shift+Enter inserts a newline. While an answer is arriving Enter
    // does nothing: the draft stays, ready to send once the answer ends or is stopped.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (input.trim() && !isLoading) submit();
    }
  };

  useEffect(() => {
    if (focusOnMount && window.matchMedia('(pointer: fine)').matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [focusOnMount]);

  const status = isLoading
    ? 'Answering…'
    : isSlash
      ? 'Command mode. Press Enter to run it.'
      : null;

  const canSend = !!input.trim() && !isSlash;

  return (
    <div className="relative w-full">
      {/* Slash-command menu */}
      <AnimatePresence>
        {showSlash && menuEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: EASE }}
            className="absolute bottom-[calc(100%+8px)] left-0 z-30 w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-[var(--shadow-float)]"
          >
            <ul
              id={listId}
              role="listbox"
              aria-label="Slash commands"
              className="max-h-[50svh] overflow-y-auto p-1.5"
            >
              {slashMatches.map((cmd, i) => {
                const selected = i === active;
                return (
                  <li
                    key={cmd.id}
                    id={`${listId}-${cmd.id}`}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => runSlash(cmd)}
                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-[16px] ${
                      selected ? 'bg-brand-soft text-foreground' : 'text-ink-soft'
                    }`}
                  >
                    <span className="w-24 shrink-0 font-medium text-brand-ink">{cmd.slash}</span>
                    <span className="min-w-0 flex-1 truncate">{cmd.label}</span>
                    <span className="meta hidden w-12 shrink-0 text-right text-muted-foreground sm:block">
                      {selected ? <CornerDownLeft className="ml-auto h-4 w-4" /> : KIND_LABEL[cmd.kind]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="composer">
          <button
            type="button"
            onClick={onOpenCommand}
            aria-label="Browse questions and commands"
            title="Browse questions and commands"
            className="icon-btn"
          >
            <Plus className="h-5 w-5" aria-hidden />
          </button>

          <div className="relative min-w-0 flex-1">
            {input.length === 0 && !showSlash && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-[10px] truncate text-[16px] leading-6 text-muted-foreground"
              >
                Ask my twin anything
              </span>
            )}
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              aria-label="Ask my AI twin a question, or type / for commands"
              aria-describedby={variant === 'dock' ? undefined : hintId}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={showSlash}
              aria-controls={showSlash ? listId : undefined}
              aria-activedescendant={
                showSlash ? `${listId}-${slashMatches[active]?.id}` : undefined
              }
              className="scrollbar-subtle relative block max-h-40 w-full resize-none bg-transparent py-[10px] text-[16px] leading-6 text-foreground focus:outline-none focus-visible:outline-none"
            />
          </div>

          {isLoading ? (
            <button type="button" onClick={stop} aria-label="Stop answering" className="composer__send">
              <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
            </button>
          ) : (
            <button type="submit" disabled={!canSend} aria-label="Send" className="composer__send">
              <ArrowUp className="h-5 w-5" aria-hidden />
            </button>
          )}
        </div>

        {variant !== 'dock' && (
          <div
            id={hintId}
            className="flex min-h-9 flex-wrap items-center justify-between gap-x-2 px-1 pt-1.5 text-[13px] leading-snug text-muted-foreground"
          >
            <span>{status ?? 'AI answers. It can make mistakes.'}</span>
            {suggestionActive && !isLoading && (
              <button
                type="button"
                onClick={acceptSuggestion}
                className="press flex min-h-7 items-center gap-1.5 font-medium text-foreground"
              >
                <kbd className="kbd !h-5 max-[1023px]:hidden">Tab</kbd>
                Use an example
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
