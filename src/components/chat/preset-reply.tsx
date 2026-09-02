'use client';

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { motion } from 'framer-motion';

import { Presentation } from '@/components/presentation';
import AllProjects from '@/components/projects/AllProjects';
import Skills from '@/components/skills';
import { Contact } from '@/components/contact';
import Resume from '@/components/resume';
import AvailabilityCard from '@/components/AvailabilityCard';
import { TurnBadge } from './turn-badge';

interface PresetReplyProps {
  question: string;
  reply: string;
  tool: string;
  onGetAIResponse: (question: string, tool: string) => void;
  onClose?: () => void;
  /** Only the most recent turn offers escalation to the live AI. */
  canEscalate?: boolean;
}

export function PresetReply({
  question,
  reply,
  tool,
  onGetAIResponse,
  onClose,
  canEscalate = true,
}: PresetReplyProps) {
  const [showAIOption, setShowAIOption] = useState(true);

  const handleGetAIResponse = () => {
    setShowAIOption(false);
    onGetAIResponse(question, tool);
  };

  const renderComponent = () => {
    switch (tool) {
      case 'getPresentation':
        return <Presentation />;
      case 'getProjects':
        return <AllProjects />;
      case 'getSkills':
        return <Skills />;
      case 'getContact':
        return <Contact />;
      case 'getResume':
        return <Resume />;
      case 'getInternship':
        return <AvailabilityCard />;
      default:
        return null;
    }
  };

  const component = renderComponent();

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* Provenance + remove-from-history */}
      <div className="mb-2 flex items-center justify-between">
        <TurnBadge kind="instant" />
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Remove this answer from the conversation"
            title="Remove from conversation"
            className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Remove
          </button>
        )}
      </div>

      {component ? (
        <div className="w-full">
          {component}

          {showAIOption && canEscalate && (
            <div className="mx-auto mt-4 flex max-w-3xl items-center justify-between gap-3 border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">
                Want the freeform version?
              </span>
              <button
                onClick={handleGetAIResponse}
                className="flex items-center gap-1.5 rounded-sm border border-border-strong px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
              >
                <Sparkles className="h-3.5 w-3.5 text-clay" />
                Ask the live AI
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-secondary/40 p-5 text-sm text-foreground/85">
          {reply}
        </div>
      )}
    </motion.div>
  );
}
