'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  Command,
  FileText,
  FolderGit2,
  Layers,
  Mail,
  Sparkles,
  User,
} from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { presetReplies, getConfig } from '@/lib/config-loader';

interface ChatLandingProps {
  submitQuery: (query: string) => void;
  handlePresetReply?: (question: string, reply: string, tool: string) => void;
  onOpenCommand?: () => void;
}

const SUGGESTIONS = [
  { q: 'Who are you?', slash: '/about', icon: User },
  { q: 'What projects are you most proud of?', slash: '/projects', icon: FolderGit2 },
  { q: 'What are your skills?', slash: '/skills', icon: Layers },
  { q: 'Are you available for work?', slash: '/hire', icon: Briefcase },
  { q: 'Can I see your résumé?', slash: '/resume', icon: FileText },
  { q: 'How can I reach you?', slash: '/contact', icon: Mail },
];

// Free-form prompts with no preset — clicking one answers live via the AI, so
// visitors discover that this is a real conversation, not a fixed FAQ.
const LIVE_EXAMPLES = [
  'How would you architect an LLM feature end to end?',
  'What was the hardest problem you solved recently?',
  'Why should I hire you over another senior engineer?',
];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] },
  },
};

const ChatLanding: React.FC<ChatLandingProps> = ({
  submitQuery,
  handlePresetReply,
  onOpenCommand,
}) => {
  const { personal, stats, availability } = getConfig();

  const ask = (q: string) => {
    const preset = presetReplies[q as keyof typeof presetReplies];
    if (preset && handlePresetReply) {
      handlePresetReply(q, preset.reply, preset.tool);
    } else {
      submitQuery(q);
    }
  };

  return (
    <motion.div
      className="mx-auto w-full max-w-2xl py-6"
      variants={container}
      initial={false}
      animate="visible"
    >
      {/* Identity */}
      <motion.div variants={item} className="flex items-center gap-4">
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border-strong">
          <Image
            src={personal.avatar}
            alt={personal.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        </span>
        <div className="min-w-0">
          {availability.open && (
            <span className="mb-1 inline-flex items-center gap-1.5 rounded-sm border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <span className="status-dot" />
              {availability.headline}
            </span>
          )}
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={item}
        className="font-display mt-6 text-[2rem] leading-[1.1] tracking-tight text-foreground sm:text-[2.75rem]"
      >
        I&apos;m {personal.shortName}. I design and ship{' '}
        <span className="text-clay">web platforms</span> and{' '}
        <span className="italic">LLM features</span>, end to end.
      </motion.h1>

      <motion.p
        variants={item}
        className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground"
      >
        Senior full-stack engineer from {personal.location}, Top Rated Plus on Upwork.
        This page is a conversation — ask it anything about my work, or pick a
        thread below.
      </motion.p>

      {/* Stats */}
      <motion.div
        variants={item}
        className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4"
      >
        {stats.map((s) => (
          <div key={s.label} className="bg-background px-4 py-3.5">
            <div className="font-display text-xl text-foreground">{s.value}</div>
            <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Suggestions */}
      <motion.div variants={item} className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            Start here
          </span>
          <button
            onClick={onOpenCommand}
            className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <Command className="h-3 w-3" /> ⌘K for everything
          </button>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
          {SUGGESTIONS.map(({ q, slash, icon: Icon }) => (
            <button
              key={q}
              onClick={() => ask(q)}
              className="group flex items-center gap-3 bg-background px-4 py-3 text-left transition-colors hover:bg-secondary"
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-clay" />
              <span className="flex-1 truncate text-sm text-foreground">{q}</span>
              <span className="font-mono text-[11px] text-muted-foreground/60">
                {slash}
              </span>
            </button>
          ))}
        </div>

        {/* Free-form: proves it's a live conversation, not a fixed FAQ */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            <Sparkles className="h-3 w-3 text-clay" /> Or ask live
          </span>
          {LIVE_EXAMPLES.map((q) => (
            <button
              key={q}
              onClick={() => submitQuery(q)}
              className="rounded-sm border border-border bg-background px-2.5 py-1 text-left text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatLanding;
