'use client';

import { presetReplies } from '@/lib/config-loader';
import type { Command } from '@/lib/commands';

interface HelperBoostProps {
  submitQuery?: (query: string) => void;
  handlePresetReply?: (question: string, reply: string, tool: string) => void;
  commands: Command[];
}

/**
 * Quick jumps shown above the composer once a conversation is under way — the
 * same six instant answers as the landing index, spelled as their slash commands
 * so visitors learn the shortcut while they click.
 */
export default function HelperBoost({
  submitQuery,
  handlePresetReply,
  commands,
}: HelperBoostProps) {
  const handleClick = (q: string) => {
    const preset = presetReplies[q as keyof typeof presetReplies];
    if (preset && handlePresetReply) {
      handlePresetReply(q, preset.reply, preset.tool);
    } else {
      submitQuery?.(q);
    }
  };

  const chips = commands.filter((c) => c.group === 'Ask');

  return (
    <nav
      aria-label="Quick answers"
      className="scrollbar-none w-full overflow-x-auto"
    >
      <ul className="flex w-max min-w-full items-center gap-1.5">
        {chips.map((cmd, i) => (
          <li
            key={cmd.id}
            className="reveal"
            style={{ '--i': i } as React.CSSProperties}
          >
            <button
              onClick={() => handleClick(cmd.payload || cmd.label)}
              title={cmd.label}
              className="press num flex h-7 shrink-0 items-center rounded-md border border-border bg-card px-2.5 text-[13px] text-ink-soft hover:border-transparent hover:text-foreground"
            >
              <span className="text-clay-ink">/</span>
              {cmd.slash?.slice(1)}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
