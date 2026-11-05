'use client';

import { presetReplies } from '@/lib/config-loader';
import type { Command } from '@/lib/commands';

interface HelperBoostProps {
  submitQuery?: (query: string) => void;
  handlePresetReply?: (question: string, reply: string, tool: string) => void;
  commands: Command[];
  /** rail: full questions in the desktop side column. row: short topic chips above the composer. */
  variant?: 'rail' | 'row';
}

/** Quick answers for a conversation under way: the same instant answers as the landing page. */
export default function HelperBoost({
  submitQuery,
  handlePresetReply,
  commands,
  variant = 'row',
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
  const short = (c: Command) => {
    const s = c.slash?.slice(1) ?? c.label;
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  return (
    <nav aria-label="Quick answers" className="w-full">
      <ul className={variant === 'rail' ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2'}>
        {chips.map((cmd) => (
          <li key={cmd.id}>
            <button
              onClick={() => handleClick(cmd.payload || cmd.label)}
              title={cmd.label}
              className={`chip ${variant === 'rail' ? 'w-full' : ''}`}
            >
              {variant === 'rail' ? cmd.label : short(cmd)}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
