'use client';

import {
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { trapTab } from '@/lib/focus';

export interface SidebarChat {
  id: string;
  title: string;
}

interface SidebarContentProps {
  chats: SidebarChat[];
  /** The chat on screen, or null for a new one not saved yet. */
  activeChatId: string | null;
  askNext: string[];
  onBack: () => void;
  onNewChat: () => void;
  onOpenChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onAsk: (question: string) => void;
  /** The control beside New chat that puts the sidebar away. */
  closeControl: ReactNode;
}

/** The way out, New chat, the saved chats and what to ask next. */
export function SidebarContent({
  chats,
  activeChatId,
  askNext,
  onBack,
  onNewChat,
  onOpenChat,
  onDeleteChat,
  onAsk,
  closeControl,
}: SidebarContentProps) {
  return (
    <>
      <div className="side__group">
        <button type="button" onClick={onBack} className="rail-link">
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          Back to portfolio
        </button>
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
      </div>

      {chats.length > 0 && (
        <nav aria-label="Chats" className="side__group">
          <p className="side__label">Chats</p>
          <ul className="flex flex-col gap-0.5">
            {chats.map((c) => (
              <li key={c.id} className="chat-row">
                <button
                  type="button"
                  onClick={() => onOpenChat(c.id)}
                  aria-current={c.id === activeChatId ? 'page' : undefined}
                  title={c.title}
                  className="rail-link"
                >
                  <span className="rail-link__text">{c.title}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteChat(c.id)}
                  aria-label={`Delete chat: ${c.title}`}
                  title="Delete chat"
                  className="chat-row__delete"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
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

/**
 * Collapsed: the three things worth one click, and resting the pointer here
 * slides the whole sidebar over the chat for a look.
 */
export function SidebarRail({
  onExpand,
  onNewChat,
  onBack,
  onPeek,
  onPeekEnd,
}: {
  onExpand: (opener: HTMLElement) => void;
  onNewChat: () => void;
  onBack: () => void;
  onPeek: () => void;
  onPeekEnd: () => void;
}) {
  return (
    <aside
      aria-label="Sidebar"
      className="side side--rail"
      onPointerEnter={(e) => e.pointerType === 'mouse' && onPeek()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onPeekEnd()}
    >
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
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to portfolio"
        title="Back to portfolio"
        className="icon-btn"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
      </button>
    </aside>
  );
}

/**
 * The sidebar over the chat. Opened on purpose (the drawer on small screens, the
 * sheet beside an open panel) it is modal: focus moves in and stays. As a peek
 * from the rail it is only a look: no focus, no scrim, gone when the pointer leaves.
 */
export function SidebarFloat({
  onClose,
  blocked,
  peek = false,
  onPeekStay,
  onPeekEnd,
  onOpenCommand,
  ...content
}: Omit<SidebarContentProps, 'closeControl'> & {
  onClose: () => void;
  /** A dialog above the sidebar owns Esc for now. */
  blocked: boolean;
  peek?: boolean;
  onPeekStay?: () => void;
  onPeekEnd?: () => void;
  /** Passed on small screens, where the top bar has no room for search and theme. */
  onOpenCommand?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (peek) return;
    const t = setTimeout(
      () => ref.current?.querySelector<HTMLElement>('button')?.focus(),
      20
    );
    return () => clearTimeout(t);
  }, [peek]);

  useEffect(() => {
    if (blocked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (!peek) {
        trapTab(e, ref.current);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [blocked, peek, onClose]);

  return (
    <>
      {!peek && <div aria-hidden className="side-scrim" onClick={onClose} />}
      <div
        ref={ref}
        role={peek ? undefined : 'dialog'}
        aria-modal={peek ? undefined : true}
        aria-label="Sidebar"
        data-peek={peek || undefined}
        onPointerEnter={(e) => peek && e.pointerType === 'mouse' && onPeekStay?.()}
        onPointerLeave={(e) => peek && e.pointerType === 'mouse' && onPeekEnd?.()}
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
        {onOpenCommand && (
          <div className="side__group mt-auto border-t border-border pt-3">
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
