'use client';

import { ArrowUpRight, Search } from 'lucide-react';
import { Github } from '@/components/ui/brand-icons';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';
import { getConfig } from '@/lib/config-loader';
import { useLocalTime } from '@/hooks/use-local-time';

interface TopBarProps {
  onOpenCommand: () => void;
  onHome: () => void;
  onHire: () => void;
}

/**
 * The masthead: identity on the left, the journal's running head on the right —
 * live local time, availability, ⌘K, the theme switch, and the one primary
 * action on every screen: Hire me.
 */
export function TopBar({ onOpenCommand, onHome, onHire }: TopBarProps) {
  const { personal, availability, social } = getConfig();
  const time = useLocalTime(personal.timezone);
  const city = personal.location.split(',')[0];
  const offset =
    personal.timezone.split('·').pop()?.trim() ?? personal.timezone;

  return (
    <header className="relative z-40 shrink-0 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Identity */}
        <button
          onClick={onHome}
          className="press group -ml-1 flex min-w-0 items-center gap-2.5 rounded-md px-1 py-1 text-left"
          aria-label={`${personal.name} — back to start`}
        >
          <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md dark:ring-1 dark:ring-border-strong">
            <Image
              src={personal.avatar}
              alt=""
              fill
              sizes="28px"
              className="object-cover"
              priority
            />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-display truncate text-[17px] leading-none text-foreground">
              <span className="sm:hidden">{personal.shortName}</span>
              <span className="hidden sm:inline">{personal.name}</span>
            </span>
            <span className="meta mt-1 hidden truncate text-muted-foreground sm:block">
              Full-stack · AI platforms
            </span>
          </span>
        </button>

        {/* Running head */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {/* Local time lives in the hero and the hire sheet; the masthead keeps
              room for the name and the primary action. */}
          {availability.open && (
            <span
              className="meta mr-2 hidden items-center gap-1.5 whitespace-nowrap text-foreground md:flex"
              title={time ? `${time.label} in ${city} (${offset})` : undefined}
              suppressHydrationWarning
            >
              <span className="status-dot" aria-hidden />
              Available
            </span>
          )}

          <button
            onClick={onOpenCommand}
            className="press flex h-8 items-center gap-2 rounded-md border border-border px-2 text-muted-foreground hover:border-border-strong hover:text-foreground"
            aria-label="Open command menu"
            aria-keyshortcuts="Meta+K Control+K"
          >
            <Search className="h-3.5 w-3.5 sm:hidden" aria-hidden />
            <span className="hidden text-[13px] sm:inline">Search</span>
            <kbd className="kbd hidden !h-5 !border-b !bg-transparent sm:inline-flex">
              ⌘K
            </kbd>
          </button>

          {social.github && (
            <a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub (opens in a new tab)"
              className="press hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground sm:flex"
            >
              <Github className="h-[15px] w-[15px]" />
            </a>
          )}

          <ThemeToggle />

          <button
            type="button"
            onClick={onHire}
            aria-haspopup="dialog"
            className="btn-clay ml-1 h-8 px-3 text-[13px]"
          >
            Hire me
            <ArrowUpRight className="hidden h-3.5 w-3.5 sm:block" aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
