'use client';

import { ArrowRight, ArrowUpRight } from 'lucide-react';
import React, { type CSSProperties } from 'react';

import { pad2 } from '@/components/artifact/artifact';
import { presetReplies, getConfig } from '@/lib/config-loader';
import type { Command } from '@/lib/commands';

interface ChatLandingProps {
  submitQuery: (query: string) => void;
  handlePresetReply?: (question: string, reply: string, tool: string) => void;
  onOpenCommand?: () => void;
  commands: Command[];
}

// Free-form prompts with no preset — clicking one answers live via the AI, so
// visitors discover that this is a real conversation, not a fixed FAQ.
const LIVE_EXAMPLES = [
  'How would you architect an LLM feature end to end?',
  'What was the hardest problem you solved recently?',
  'Why should I hire you over another senior engineer?',
];

const ChatLanding: React.FC<ChatLandingProps> = ({
  submitQuery,
  handlePresetReply,
  onOpenCommand,
  commands,
}) => {
  const config = getConfig();
  const { personal, stats, availability } = config;

  // A one-line, factual subtitle for each index card, derived from the config.
  const facts: Record<string, string> = (() => {
    const years = config.experience
      .flatMap((e) => e.duration.match(/\d{4}/g) ?? [])
      .map(Number);
    const since = years.length ? Math.min(...years) : null;
    const skillCount = Object.values(config.skills).flat().length;
    const disciplines = Object.values(config.skills).filter(
      (s) => s.length
    ).length;
    return {
      about: `${personal.location.split(',')[0]} · ${personal.timezone.split('·').pop()?.trim()}`,
      projects: `${config.projects.length} case studies`,
      skills: `${skillCount} tools · ${disciplines} disciplines`,
      resume: `${config.experience.length} roles${since ? ` · ${since}–now` : ''}`,
      availability: availability.types.join(' · '),
      contact: 'Email · Upwork · GitHub',
    };
  })();

  const index = commands.filter((c) => c.group === 'Ask');

  const ask = (q: string) => {
    const preset = presetReplies[q as keyof typeof presetReplies];
    if (preset && handlePresetReply) {
      handlePresetReply(q, preset.reply, preset.tool);
    } else {
      submitQuery(q);
    }
  };

  const [firstName] = personal.shortName.split(' ');

  return (
    <div className="mx-auto w-full py-10 sm:py-14">
      {/* Status */}
      {availability.open && (
        <p
          className="reveal meta flex items-center gap-2 text-ink-soft"
          style={{ '--i': 0 } as CSSProperties}
        >
          <span className="status-dot" aria-hidden />
          {availability.headline}
        </p>
      )}

      {/* Greeting */}
      <h1
        className="reveal font-display mt-5 text-[2.875rem] leading-[0.98] tracking-[-0.035em] text-foreground sm:text-[4rem]"
        style={{ '--i': 1 } as CSSProperties}
      >
        Hello, I&apos;m{' '}
        <em className="italic tracking-[-0.03em]">{firstName}.</em>
      </h1>

      <p
        className="reveal font-display measure mt-5 text-[1.3125rem] leading-[1.38] tracking-[-0.012em] text-ink-soft sm:text-[1.5rem]"
        style={{ '--i': 2 } as CSSProperties}
      >
        {personal.tagline}
      </p>

      {/* Telemetry */}
      <dl
        className="reveal mt-9 grid grid-cols-2 gap-px border-y border-border bg-border-subtle sm:grid-cols-4"
        style={{ '--i': 3 } as CSSProperties}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1.5 bg-background py-4 pr-3 pl-4 max-sm:odd:pl-0 sm:first:pl-0"
          >
            <dt className="text-[12px] leading-snug text-muted-foreground">
              {s.label}
            </dt>
            <dd className="num order-first text-[1.375rem] leading-none text-foreground">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Index */}
      <section aria-labelledby="index-heading" className="mt-10">
        <div
          className="reveal mb-3 flex items-baseline justify-between gap-4"
          style={{ '--i': 4 } as CSSProperties}
        >
          <h2 id="index-heading" className="meta text-muted-foreground">
            Index <span className="text-border-strong">/</span>{' '}
            <span className="num">{pad2(index.length)}</span> entries
          </h2>
          <button
            onClick={onOpenCommand}
            className="press flex items-center gap-1.5 rounded-sm text-[12px] text-muted-foreground hover:text-foreground"
          >
            Every command <kbd className="kbd">⌘K</kbd>
          </button>
        </div>

        <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-3">
          {index.map((cmd, i) => (
            <li
              key={cmd.id}
              className="reveal flex"
              style={{ '--i': 5 + i } as CSSProperties}
            >
              <button
                onClick={() => ask(cmd.payload || cmd.label)}
                className="group flex min-h-[8.5rem] w-full flex-col justify-between gap-4 bg-card p-4 text-left transition-colors duration-200 hover:bg-background focus-visible:z-10 focus-visible:outline-offset-[-2px] sm:p-5"
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="num text-[11px] text-muted-foreground">
                    {pad2(i + 1)}
                  </span>
                  <span className="meta normal-case tracking-normal text-clay-ink">
                    {cmd.slash}
                  </span>
                </span>
                <span className="font-display text-[1.0625rem] leading-[1.22] text-foreground sm:text-[1.1875rem]">
                  {cmd.label}
                </span>
                <span className="flex w-full items-center justify-between gap-2 text-[12px] text-muted-foreground">
                  <span className="truncate">{facts[cmd.id] ?? cmd.hint}</span>
                  <ArrowUpRight
                    aria-hidden
                    className="h-3.5 w-3.5 shrink-0 -translate-x-1 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-clay"
                  />
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      {/* Free-form: proves it's a live conversation, not a fixed FAQ */}
      <section
        aria-labelledby="live-heading"
        className="reveal mt-8"
        style={{ '--i': 11 } as CSSProperties}
      >
        <h2
          id="live-heading"
          className="meta mb-1 flex items-center gap-2 text-muted-foreground"
        >
          Or ask the live model
        </h2>
        <ul>
          {LIVE_EXAMPLES.map((q) => (
            <li
              key={q}
              className="border-b border-border-subtle last:border-b-0"
            >
              <button
                onClick={() => submitQuery(q)}
                className="group flex w-full items-center gap-3 py-2.5 text-left text-[14px] text-ink-soft transition-colors duration-200 hover:text-foreground"
              >
                <ArrowRight
                  aria-hidden
                  className="h-3.5 w-3.5 shrink-0 text-border-strong transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-clay"
                />
                <span className="flex-1">{q}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ChatLanding;
