'use client';

import { ArrowUpRight, Search } from 'lucide-react';
import { Github } from '@/components/ui/brand-icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { getConfig } from '@/lib/config-loader';
import { useLocalTime } from '@/hooks/use-local-time';

interface TopBarProps {
  onOpenCommand: () => void;
  onHome: () => void;
  onHire: () => void;
}

/**
 * A plain bar: the wordmark, a few controls (availability, ⌘K, GitHub, theme)
 * and the one primary action on every screen — Hire me, in the accent.
 */
export function TopBar({ onOpenCommand, onHome, onHire }: TopBarProps) {
  const { personal, availability, social } = getConfig();
  const time = useLocalTime(personal.timezone);
  const city = personal.location.split(',')[0];
  const offset =
    personal.timezone.split('·').pop()?.trim() ?? personal.timezone;

  return (
    <header className="relative z-40 shrink-0 bg-background">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        {/* Wordmark */}
        <button
          onClick={onHome}
          className="press min-w-0 text-left"
          aria-label={`${personal.name} — back to start`}
        >
          <span className="font-display block truncate text-[16px] tracking-[-0.02em] text-foreground sm:text-lead">
            <span className="sm:hidden">{personal.shortName}</span>
            <span className="hidden sm:inline">{personal.name}</span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {availability.open && (
            <span
              className="mr-3 hidden items-center gap-2 whitespace-nowrap text-[16px] text-foreground md:flex"
              title={time ? `${time.label} in ${city} (${offset})` : undefined}
              suppressHydrationWarning
            >
              <span className="status-dot" aria-hidden />
              Available
            </span>
          )}

          <button
            onClick={onOpenCommand}
            className="press flex h-10 items-center gap-2 px-2 text-[16px] text-foreground hover:bg-secondary"
            aria-label="Open command menu"
            aria-keyshortcuts="Meta+K Control+K"
          >
            <Search className="h-4 w-4 sm:hidden" aria-hidden />
            <span className="hidden sm:inline">Search</span>
            <kbd className="kbd hidden sm:inline-flex">⌘K</kbd>
          </button>

          {social.github && (
            <a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub (opens in a new tab)"
              className="press hidden h-10 w-10 items-center justify-center text-foreground hover:bg-secondary sm:flex"
            >
              <Github className="h-4 w-4" />
            </a>
          )}

          <ThemeToggle />

          <button
            type="button"
            onClick={onHire}
            aria-haspopup="dialog"
            className="btn-clay ml-1 h-10 px-4 text-[16px]"
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
