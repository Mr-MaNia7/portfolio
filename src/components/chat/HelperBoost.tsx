'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  FileText,
  FolderGit2,
  Layers,
  Mail,
  User,
} from 'lucide-react';
import { presetReplies } from '@/lib/config-loader';

interface HelperBoostProps {
  submitQuery?: (query: string) => void;
  handlePresetReply?: (question: string, reply: string, tool: string) => void;
}

const CHIPS = [
  { label: 'About', q: 'Who are you?', icon: User },
  { label: 'Projects', q: 'What projects are you most proud of?', icon: FolderGit2 },
  { label: 'Skills', q: 'What are your skills?', icon: Layers },
  { label: 'Résumé', q: 'Can I see your résumé?', icon: FileText },
  { label: 'Hire me', q: 'Are you available for work?', icon: Briefcase },
  { label: 'Contact', q: 'How can I reach you?', icon: Mail },
];

export default function HelperBoost({
  submitQuery,
  handlePresetReply,
}: HelperBoostProps) {
  const handleClick = (q: string) => {
    const preset = presetReplies[q as keyof typeof presetReplies];
    if (preset && handlePresetReply) {
      handlePresetReply(q, preset.reply, preset.tool);
    } else {
      submitQuery?.(q);
    }
  };

  return (
    <div className="custom-scrollbar w-full overflow-x-auto">
      <div className="flex w-max min-w-full items-center justify-start gap-2 pb-1 sm:justify-center">
        {CHIPS.map(({ label, q, icon: Icon }, i) => (
          <motion.button
            key={label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i, duration: 0.25 }}
            onClick={() => handleClick(q)}
            className="flex shrink-0 items-center gap-2 rounded-sm border border-border bg-card px-3 py-1.5 text-[13px] text-foreground/80 transition-colors hover:border-border-strong hover:bg-secondary hover:text-foreground"
          >
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            {label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
