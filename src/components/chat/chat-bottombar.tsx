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
  'How would you architect a RAG pipeline?',
  'What was the hardest bug you shipped a fix for?',
  'How do you approach LLM evals?',
  "What's your experience leading a team?",
  'Why should I hire you over another senior engineer?',
];

const MAX_TEXTAREA_HEIGHT = 160; // ~6 lines

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
    return commands
      .filter((c) => {
        if (!c.slash) return false;
        const s = c.slash.slice(1).toLowerCase();
        return (
          s.startsWith(q) ||
          c.keywords.some((k) => k.toLowerCase().startsWith(q)) ||
          c.label.toLowerCase().includes(q)
        );
      })
      .slice(0, 6);
  }, [isSlash, input, commands]);

  const showSlash = isSlash && slashMatches.length > 0;

  // A suggestion is offered only while the field is empty and idle — so Tab is
  // never intercepted mid-typing, and the ghost text can't be mistaken for
  // something the user actually entered.
  const suggestionActive = input.length === 0 && !isToolInProgress && !showSlash;

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
      3800
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
        setActive((a) => Math.min(a + 1, slashMatches.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        runSlash(slashMatches[active]);
        return;
      }
      if (e.key === 'Escape') {
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

  return (
    <div className="relative w-full">
      {/* Slash-command menu */}
      <AnimatePresence>
        {showSlash && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.14 }}
            className="absolute bottom-[calc(100%+8px)] left-0 z-30 w-full overflow-hidden rounded-lg border border-border-strong bg-popover"
          >
            <div className="border-b border-border px-3 py-1.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
              Commands
            </div>
            <div className="p-1">
              {slashMatches.map((cmd, i) => (
                <button
                  key={cmd.id}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => runSlash(cmd)}
                  className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors ${
                    i === active ? 'bg-secondary text-foreground' : 'text-foreground/80'
                  }`}
                >
                  <span className="font-mono text-xs text-clay">{cmd.slash}</span>
                  <span className="flex-1 truncate">{cmd.label}</span>
                  {i === active && (
                    <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="group flex items-end gap-2 rounded-lg border border-input bg-card px-3 py-2 transition-colors focus-within:border-border-strong">
          <span
            aria-hidden
            className="select-none py-1 pl-0.5 font-mono text-sm text-clay"
          >
            ›
          </span>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isToolInProgress ? 'One moment…' : currentExample
            }
            aria-label="Ask a question"
            className="custom-scrollbar max-h-40 w-full resize-none self-center bg-transparent py-1 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
            disabled={isToolInProgress}
          />

          {/* Accept-suggestion hint — tappable, so mobile (no Tab key) can use it too */}
          {suggestionActive && (
            <button
              type="button"
              onClick={acceptSuggestion}
              aria-label={`Use example question: ${currentExample}`}
              title="Fill this question"
              className="mb-1 flex shrink-0 items-center gap-1 self-end rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              ⇥ Tab
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCommand}
            aria-label="Open command menu"
            className="mb-1 hidden items-center gap-1 self-end rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            ⌘K
          </button>

          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop"
              className="flex h-8 w-8 shrink-0 items-center justify-center self-end rounded-full bg-primary text-primary-foreground transition-transform active:translate-y-px"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || isToolInProgress}
              aria-label="Send"
              className="flex h-8 w-8 shrink-0 items-center justify-center self-end rounded-full bg-primary text-primary-foreground transition-transform active:translate-y-px disabled:opacity-35"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
