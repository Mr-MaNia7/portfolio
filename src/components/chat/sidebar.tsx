'use client';

import {
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
} from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { trapTab } from '@/lib/focus';

export interface SidebarTurn {
  key: string;
  question: string;
}

interface SidebarContentProps {
  turns: SidebarTurn[];
  currentKey: string | null;
  askNext: string[];
  onNewChat: () => void;
  onJump: (key: string) => void;
  onAsk: (question: string) => void;
  /** The control beside New chat that puts the sidebar away. */
  closeControl: ReactNode;
}

/** New chat, what has been asked so far, and what to ask next. */
export function SidebarContent({
  turns,
  currentKey,
  askNext,
  onNewChat,
  onJump,
  onAsk,
  closeControl,
}: SidebarContentProps) {
  return (
    <>
      <div className="side__row">
        <button
          type="button"
          onClick={onNewChat}
          className="rail-link rail-link--strong"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          New chat
        </button>
        {closeControl}
      </div>

      {turns.length > 0 && (
        <nav aria-label="This chat" className="side__group">
          <p className="side__label">This chat</p>
          <ul className="flex flex-col gap-0.5">
            {turns.map((t) => (
              <li key={t.key}>
                <button
                  type="button"
                  onClick={() => onJump(t.key)}
                  aria-current={t.key === currentKey ? 'true' : undefined}
                  title={t.question}
                  className="rail-link"
                >
                  <span className="rail-link__text">{t.question}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {askNext.length > 0 && (
        <nav aria-label="Ask next" className="side__group">
          <p className="side__label">Ask next</p>
          <ul className="flex flex-col gap-0.5">
            {askNext.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => onAsk(q)}
                  className="rail-link"
                >
                  <span className="rail-link__text">{q}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}

/** Collapsed: open the sidebar again, or start over. */
export function SidebarRail({
  onExpand,
  onNewChat,
}: {
  onExpand: (opener: HTMLElement) => void;
  onNewChat: () => void;
}) {
  return (
    <aside aria-label="Sidebar" className="side side--rail">
      <button
        type="button"
        onClick={(e) => onExpand(e.currentTarget)}
        aria-label="Open sidebar"
        title="Open sidebar"
        className="icon-btn"
      >
        <PanelLeftOpen className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onNewChat}
        aria-label="New chat"
        title="New chat"
        className="icon-btn"
      >
        <Plus className="h-5 w-5" aria-hidden />
      </button>
    </aside>
  );
}

/**
 * The sidebar opened over the chat: the drawer on small screens, which also holds
 * what the top bar has no room for, and a floating sheet beside an open panel.
 */
export function SidebarFloat({
  onClose,
  blocked,
  onBackToPortfolio,
  onOpenCommand,
  ...content
}: Omit<SidebarContentProps, 'closeControl'> & {
  onClose: () => void;
  /** A dialog above the sidebar owns Esc for now. */
  blocked: boolean;
  /** Passed on small screens, where the top bar has no room for these. */
  onBackToPortfolio?: () => void;
  onOpenCommand?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(
      () => ref.current?.querySelector<HTMLElement>('button')?.focus(),
      20
    );
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (blocked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else {
        trapTab(e, ref.current);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [blocked, onClose]);

  return (
    <>
      <div aria-hidden className="side-scrim" onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar"
        className="side-float scrollbar-subtle"
      >
        <SidebarContent
          {...content}
          closeControl={
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              title="Close sidebar"
              className="icon-btn"
            >
              <PanelLeftClose className="h-5 w-5" aria-hidden />
            </button>
          }
        />
        {onBackToPortfolio && (
          <div className="side__group mt-auto border-t border-border pt-3">
            <button
              type="button"
              onClick={onBackToPortfolio}
              className="rail-link"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              Back to portfolio
            </button>
            <button type="button" onClick={onOpenCommand} className="rail-link">
              <Search className="h-4 w-4 shrink-0" aria-hidden />
              Search questions and commands
            </button>
            <div className="flex min-h-11 items-center justify-between text-[15px] text-ink-soft">
              Appearance
              <ThemeToggle className="-mr-2" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/** The docked sidebar's control for putting itself away. */
export function SidebarCollapse({ onCollapse }: { onCollapse: () => void }) {
  return (
    <button
      type="button"
      onClick={onCollapse}
      aria-label="Collapse sidebar"
      title="Collapse sidebar"
      className="icon-btn"
    >
      <PanelLeftClose className="h-5 w-5" aria-hidden />
    </button>
  );
}
