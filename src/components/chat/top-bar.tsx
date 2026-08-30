'use client';

import { Command as CommandIcon, Github } from 'lucide-react';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';
import { getConfig } from '@/lib/config-loader';

interface TopBarProps {
  onOpenCommand: () => void;
  onHome: () => void;
}

export function TopBar({ onOpenCommand, onHome }: TopBarProps) {
  const { personal, availability, social } = getConfig();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4">
        {/* Identity */}
        <button
          onClick={onHome}
          className="group flex items-center gap-2.5 text-left"
          aria-label="Back to start"
        >
          <span className="relative h-8 w-8 overflow-hidden rounded-full border border-border-strong">
            <Image
              src={personal.avatar}
              alt={personal.name}
              fill
              sizes="32px"
              className="object-cover"
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[15px] tracking-tight text-foreground">
              {personal.shortName} G. Mohammed
            </span>
            <span className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block">
              Senior Full-Stack Engineer · AI/LLM
            </span>
          </span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {availability.open && (
            <span className="hidden items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground md:flex">
              <span className="status-dot" />
              Available
            </span>
          )}

          <button
            onClick={onOpenCommand}
            className="flex items-center gap-2 rounded-sm border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            aria-label="Open command menu"
          >
            <CommandIcon className="h-3.5 w-3.5" />
            <span className="hidden font-mono text-[11px] sm:inline">⌘K</span>
          </button>

          {social.github && (
            <a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hidden h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground sm:flex"
            >
              <Github className="h-[15px] w-[15px]" />
            </a>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default TopBar;
