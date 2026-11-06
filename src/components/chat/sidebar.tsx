'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import {
  ArrowLeft,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
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
  onSearch: () => void;
  onOpenChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onAsk: (question: string) => void;
  /** The control on the first row that puts the sidebar away. */
  closeControl: ReactNode;
}

const isMac = () =>
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPad/.test(navigator.platform);

/** The keys that open and close the sidebar, as the visitor's keyboard shows them. */
export const sidebarShortcut = () => (isMac() ? '⇧⌘S' : 'Ctrl+Shift+S');
const searchShortcut = () => (isMac() ? '⌘K' : 'Ctrl+K');

/** A dark label beside a sidebar control, with its keyboard shortcut when it has one. */
function RailTip({
  label,
  keys,
  side = 'right',
  children,
}: {
  label: string;
  keys?: string;
  side?: 'right' | 'bottom';
  children: ReactNode;
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="rail-tip"
        >
          {label}
          {keys && <kbd className="rail-tip__keys">{keys}</kbd>}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

/**
 * Open and collapsed share one set of rows: the toggle, Back to portfolio,
 * New chat and Search sit at the same height in both, so nothing moves when
 * the sidebar opens or closes.
 */
export function SidebarContent({
  chats,
  activeChatId,
  askNext,
  onBack,
  onNewChat,
  onSearch,
  onOpenChat,
  onDeleteChat,
  onAsk,
  closeControl,
}: SidebarContentProps) {
  return (
    <>
      <div className="side__group">
        <div className="side__head">{closeControl}</div>
        <button type="button" onClick={onBack} className="rail-link">
          <ArrowLeft className="side__icon" aria-hidden />
          Back to portfolio
        </button>
        <button
          type="button"
          onClick={onNewChat}
          className="rail-link rail-link--strong"
        >
          <Plus className="side__icon" aria-hidden />
          New chat
        </button>
        <button type="button" onClick={onSearch} className="rail-link">
          <Search className="side__icon" aria-hidden />
          Search
          <kbd className="rail-link__keys">{searchShortcut()}</kbd>
        </button>
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

/** A collapsed-rail icon with its label beside it. */
function RailButton({
  label,
  keys,
  onClick,
  children,
  ...rest
}: {
  label: string;
  keys?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <RailTip label={label} keys={keys}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="icon-btn side__rail-btn"
        {...rest}
      >
        {children}
      </button>
    </RailTip>
  );
}

/** The saved chats in a small card beside the rail, opened on a click. */
function RecentsMenu({
  chats,
  activeChatId,
  onOpenChat,
}: {
  chats: SidebarChat[];
  activeChatId: string | null;
  onOpenChat: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (refocus: boolean) => {
      setOpen(false);
      if (refocus) triggerRef.current?.focus({ preventScroll: true });
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !triggerRef.current?.contains(t)) {
        close(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const items = [
          ...(menuRef.current?.querySelectorAll<HTMLElement>('button') ?? []),
        ];
        if (!items.length) return;
        e.preventDefault();
        const i = items.indexOf(document.activeElement as HTMLElement);
        const next =
          e.key === 'ArrowDown'
            ? items[(i + 1) % items.length]
            : items[(i - 1 + items.length) % items.length];
        next.focus();
      } else if (e.key === 'Tab') {
        close(false);
      }
    };
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    const t = setTimeout(
      () => menuRef.current?.querySelector<HTMLElement>('button')?.focus(),
      0
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) {
      setPos({
        top: Math.max(8, Math.min(r.top, window.innerHeight - 420)),
        left: r.right + 8,
      });
    }
    setOpen((o) => !o);
  };

  return (
    <>
      <RailButton
        ref={triggerRef}
        label="Recents"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        data-open={open || undefined}
      >
        <History className="side__icon side__icon--rail" aria-hidden />
      </RailButton>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Recent chats"
          className="recents scrollbar-subtle"
          style={pos}
        >
          <p className="side__label px-3 pt-1">Recents</p>
          {chats.map((c) => (
            <button
              key={c.id}
              type="button"
              role="menuitem"
              title={c.title}
              aria-current={c.id === activeChatId ? 'page' : undefined}
              onClick={() => {
                setOpen(false);
                onOpenChat(c.id);
              }}
              className="recents__item"
            >
              <span className="rail-link__text">{c.title}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/**
 * Collapsed: icons on the same rows as the open sidebar. Nothing opens on
 * hover, but the whole empty rail is one click target for opening it.
 */
export function SidebarRail({
  chats,
  activeChatId,
  onExpand,
  onNewChat,
  onBack,
  onSearch,
  onOpenChat,
}: {
  chats: SidebarChat[];
  activeChatId: string | null;
  onExpand: (opener: HTMLElement) => void;
  onNewChat: () => void;
  onBack: () => void;
  onSearch: () => void;
  onOpenChat: (id: string) => void;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={0} skipDelayDuration={300}>
      <aside aria-label="Sidebar" className="side side--rail">
        {/* The rail's empty space: a mouse target only, the first button is the keyboard's way */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={(e) => onExpand(e.currentTarget)}
          className="side__rail-hit"
        />
        <div className="side__head">
          <RailButton
            label="Open sidebar"
            keys={sidebarShortcut()}
            aria-keyshortcuts="Meta+Shift+S Control+Shift+S"
            onClick={(e) => onExpand(e.currentTarget)}
          >
            <PanelLeftOpen
              className="side__icon side__icon--rail"
              aria-hidden
            />
          </RailButton>
        </div>
        <RailButton label="Back to portfolio" onClick={onBack}>
          <ArrowLeft className="side__icon side__icon--rail" aria-hidden />
        </RailButton>
        <RailButton label="New chat" onClick={onNewChat}>
          <Plus className="side__icon side__icon--rail" aria-hidden />
        </RailButton>
        <RailButton
          label="Search"
          keys={searchShortcut()}
          aria-keyshortcuts="Meta+K Control+K"
          onClick={onSearch}
        >
          <Search className="side__icon side__icon--rail" aria-hidden />
        </RailButton>
        {chats.length > 0 && (
          <RecentsMenu
            chats={chats}
            activeChatId={activeChatId}
            onOpenChat={onOpenChat}
          />
        )}
      </aside>
    </TooltipPrimitive.Provider>
  );
}

/**
 * The sidebar over the chat (the drawer on small screens, the sheet beside an
 * open panel). It is modal: focus moves in and stays until it closes.
 */
export function SidebarFloat({
  onClose,
  blocked,
  showAppearance = false,
  ...content
}: Omit<SidebarContentProps, 'closeControl'> & {
  onClose: () => void;
  /** A dialog above the sidebar owns Esc for now. */
  blocked: boolean;
  /** On small screens the top bar has no room for the theme switch. */
  showAppearance?: boolean;
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
        aria-modal
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
              className="icon-btn side__rail-btn"
            >
              <PanelLeftClose
                className="side__icon side__icon--rail"
                aria-hidden
              />
            </button>
          }
        />
        {showAppearance && (
          <div className="side__group mt-auto border-t border-border pt-3">
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

/** The open sidebar's control for putting itself away, on the toggle's own row. */
export function SidebarCollapse({ onCollapse }: { onCollapse: () => void }) {
  return (
    <TooltipPrimitive.Provider delayDuration={0}>
      <RailTip label="Close sidebar" keys={sidebarShortcut()}>
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Close sidebar"
          aria-keyshortcuts="Meta+Shift+S Control+Shift+S"
          className="icon-btn side__rail-btn"
        >
          <PanelLeftClose className="side__icon side__icon--rail" aria-hidden />
        </button>
      </RailTip>
    </TooltipPrimitive.Provider>
  );
}
