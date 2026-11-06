'use client';

import { ArrowUpRight, Menu, Search, X } from 'lucide-react';
import { Github } from '@/components/ui/brand-icons';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { getConfig } from '@/lib/config-loader';

interface TopBarProps {
  onOpenCommand: () => void;
  onHome: () => void;
  onHire: () => void;
  /** In a conversation the bar sits in the app shell and the section links give way to a way back. */
  conversation?: boolean;
  /** Under 1024 the conversation's one menu is the sidebar drawer. */
  onOpenSidebar?: () => void;
  sidebarOpen?: boolean;
}

const WORDS = [
  { href: '#twin', label: 'Twin' },
  { href: '#work', label: 'Work' },
  { href: '#services', label: 'Services' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#questions', label: 'Questions' },
];

export function TopBar({ onOpenCommand, onHome, onHire, conversation = false, onOpenSidebar, sidebarOpen = false }: TopBarProps) {
  const { personal, social } = getConfig();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header className={`nav ${conversation ? 'nav--static' : ''}`}>
      <div className="wrap">
        <div className="flex min-w-0 items-center gap-2 lg:gap-6">
          {conversation && (
            <button
              type="button"
              onClick={onOpenSidebar}
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
              className="icon-btn -ml-2 lg:!hidden"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          )}
          <button
            onClick={onHome}
            className="press flex min-w-0 shrink-0 items-center gap-2.5 text-left"
            aria-label={`${personal.name}, back to start`}
          >
            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
              <Image src={personal.avatar} alt="" fill sizes="32px" className="object-cover" priority />
            </span>
            <span className="font-display truncate text-[18px] leading-none text-foreground">
              <span className="sm:hidden lg:inline xl:hidden">{personal.shortName}</span>
              <span className="hidden sm:inline lg:hidden xl:inline">{personal.name}</span>
            </span>
          </button>
        </div>

        {!conversation && (
          <nav aria-label="Sections" className="hidden items-center gap-5 lg:flex xl:gap-7">
            {WORDS.map((w) => (
              <a key={w.href} href={w.href} className="nav__word">
                {w.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onOpenCommand}
            className="press hidden h-11 items-center gap-2 rounded-xl px-3 text-[15px] font-medium text-ink-soft hover:text-foreground lg:flex"
            aria-label="Open command menu"
            aria-keyshortcuts="Meta+K Control+K"
          >
            <Search className="h-4 w-4" aria-hidden />
            <span className="hidden xl:inline">Search</span>
            <kbd className="kbd hidden xl:inline-flex">⌘K</kbd>
          </button>

          {social.github && !conversation && (
            <a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub (opens in a new tab)"
              className="icon-btn !hidden lg:!inline-flex"
            >
              <Github className="h-[18px] w-[18px]" />
            </a>
          )}

          <ThemeToggle className="!hidden lg:!inline-flex" />

          <button type="button" onClick={onHire} aria-haspopup="dialog" className="btn btn--primary ml-2 max-sm:!min-h-10 max-sm:!px-3.5">
            Hire me
            <ArrowUpRight className="hidden h-4 w-4 sm:block" aria-hidden />
          </button>

          {!conversation && (
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="icon-btn -mr-2 ml-1 lg:!hidden"
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          )}
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-x-0 top-[var(--nav)] bottom-0 z-50 overflow-y-auto bg-background lg:hidden"
          role="dialog"
          aria-label="Menu"
        >
          <div className="wrap flex flex-col py-2 pb-[calc(16px+env(safe-area-inset-bottom))]">
            {WORDS.map((w) => (
              <a
                key={w.href}
                href={w.href}
                onClick={close}
                className="flex h-14 items-center border-b border-border text-[20px] font-medium"
              >
                {w.label}
              </a>
            ))}
            <button
              onClick={() => {
                close();
                onOpenCommand();
              }}
              className="flex h-14 items-center gap-3 border-b border-border text-left text-[20px] font-medium"
            >
              <Search className="h-5 w-5" aria-hidden />
              Search questions and commands
            </button>
            {social.github && (
              <a
                href={social.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="flex h-14 items-center gap-3 border-b border-border text-[20px] font-medium"
              >
                <Github className="h-5 w-5" />
                GitHub
              </a>
            )}
            <div className="flex h-14 items-center justify-between text-[20px] font-medium">
              Appearance
              <ThemeToggle className="-mr-2" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default TopBar;
