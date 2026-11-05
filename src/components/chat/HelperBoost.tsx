'use client';

import { presetReplies } from '@/lib/config-loader';
import type { Command } from '@/lib/commands';

interface HelperBoostProps {
  submitQuery?: (query: string) => void;
  handlePresetReply?: (question: string, reply: string, tool: string) => void;
  commands: Command[];
  /** rail: full questions in the desktop side column. row: short topic chips above the composer. */
  variant?: 'rail' | 'row';
  /** The question the newest answer belongs to, marked in the rail. */
  current?: string;
}

/** Quick answers for a conversation under way: the same instant answers as the landing page. */
export default function HelperBoost({
  submitQuery,
  handlePresetReply,
  commands,
  variant = 'row',
  current,
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
      <ul className={variant === 'rail' ? 'flex flex-col gap-0.5' : 'flex flex-wrap gap-2'}>
        {chips.map((cmd) => (
          <li key={cmd.id}>
            <button
              onClick={() => handleClick(cmd.payload || cmd.label)}
              title={cmd.label}
              aria-current={variant === 'rail' && (cmd.payload || cmd.label) === current ? 'true' : undefined}
              className={variant === 'rail' ? 'rail-link' : 'chip'}
            >
              {variant === 'rail' ? cmd.label : short(cmd)}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
