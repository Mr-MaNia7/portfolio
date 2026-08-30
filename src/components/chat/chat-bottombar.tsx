'use client';

import { ChatRequestOptions } from 'ai';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, CornerDownLeft, Square } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Command } from '@/lib/commands';

interface ChatBottombarProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(0);

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

  useEffect(() => setActive(0), [input]);

  const clearInput = () =>
    handleInputChange({
      target: { value: '' },
    } as React.ChangeEvent<HTMLInputElement>);

  const runSlash = (cmd: Command) => {
    clearInput();
    onRunCommand(cmd);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        e.preventDefault();
        runSlash(slashMatches[active]);
        return;
      }
      if (e.key === 'Escape') {
        clearInput();
        return;
      }
    }

    if (
      e.key === 'Enter' &&
      !e.nativeEvent.isComposing &&
      !isToolInProgress &&
      input.trim()
    ) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
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
        <div className="group flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 transition-colors focus-within:border-border-strong">
          <span
            aria-hidden
            className="select-none pl-0.5 font-mono text-sm text-clay"
          >
            ›
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isToolInProgress
                ? 'One moment…'
                : 'Ask me anything — or type / for commands'
            }
            aria-label="Ask a question"
            className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            disabled={isToolInProgress}
          />

          <button
            type="button"
            onClick={onOpenCommand}
            aria-label="Open command menu"
            className="hidden items-center gap-1 rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            ⌘K
          </button>

          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              aria-label="Stop"
              className="flex h-8 w-8 items-center justify-center rounded-t-none rounded-b-lg bg-primary text-primary-foreground transition-transform active:translate-y-px"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || isToolInProgress}
              aria-label="Send"
              className="flex h-8 w-8 items-center justify-center rounded-t-none rounded-b-lg bg-primary text-primary-foreground transition-transform active:translate-y-px disabled:opacity-35"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
