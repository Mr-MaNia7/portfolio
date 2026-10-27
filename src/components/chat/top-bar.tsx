'use client';

import { ArrowUpRight, Search } from 'lucide-react';
import { Github } from '@/components/ui/brand-icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { getConfig } from '@/lib/config-loader';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onOpenCommand: () => void;
  onHome: () => void;
  onHire: () => void;
  /** On the landing the bar sits on the slate field, joined to the hero. */
  onField?: boolean;
}

/**
 * A plain bar: the name as a wordmark, search (⌘K), GitHub, the theme switch,
 * and the one primary action on every screen: Hire me.
 */
export function TopBar({ onOpenCommand, onHome, onHire, onField }: TopBarProps) {
  const { personal, social } = getConfig();

  return (
    <header
      className={cn(
        'relative z-40 shrink-0 bg-background text-foreground',
        onField && 'on-field'
      )}
    >
      <div
        className={cn(
          'mx-auto flex h-14 items-center justify-between gap-4',
          onField ? 'px-5 sm:px-8' : 'max-w-3xl px-4 sm:px-6'
        )}
      >
        <button
          onClick={onHome}
          className="press flex min-w-0 items-center text-left"
          aria-label={`${personal.name} — back to start`}
        >
          <span className="font-display truncate text-[1.625rem] leading-none text-foreground">
            <span className="sm:hidden">{personal.shortName}</span>
            <span className="hidden sm:inline">{personal.name}</span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <button
            onClick={onOpenCommand}
            className="press flex h-9 items-center gap-2 px-2 text-[16px] text-foreground hover:bg-secondary"
            aria-label="Open command menu"
            aria-keyshortcuts="Meta+K Control+K"
          >
            <Search className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Search</span>
            <kbd className="kbd hidden sm:inline-flex">⌘K</kbd>
          </button>

          {social.github && (
            <a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub (opens in a new tab)"
              className="press hidden h-9 w-9 items-center justify-center text-foreground hover:bg-secondary sm:flex"
            >
              <Github className="h-4 w-4" />
            </a>
          )}

          <ThemeToggle />

          <button
            type="button"
            onClick={onHire}
            aria-haspopup="dialog"
            className="btn-clay ml-1 h-9 px-3.5 text-[16px]"
          >
            Hire me
            <ArrowUpRight className="hidden h-4 w-4 sm:block" aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
