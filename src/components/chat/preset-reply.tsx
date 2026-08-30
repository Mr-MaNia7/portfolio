'use client';

import { useState } from 'react';
import { Sparkles, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

import { Presentation } from '@/components/presentation';
import AllProjects from '@/components/projects/AllProjects';
import Skills from '@/components/skills';
import { Contact } from '@/components/contact';
import Resume from '@/components/resume';
import AvailabilityCard from '@/components/AvailabilityCard';

interface PresetReplyProps {
  question: string;
  reply: string;
  tool: string;
  onGetAIResponse: (question: string, tool: string) => void;
  onClose?: () => void;
}

export function PresetReply({
  question,
  reply,
  tool,
  onGetAIResponse,
  onClose,
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {component ? (
        <div className="w-full">
          {component}

          {showAIOption && (
            <div className="mx-auto mt-4 flex max-w-3xl items-center justify-between gap-3 border-t border-border pt-3">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-clay" />
                Instant answer — no API used
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGetAIResponse}
                  className="flex items-center gap-1.5 rounded-sm border border-border-strong px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Ask the live AI
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    aria-label="Dismiss"
                    className="flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
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
