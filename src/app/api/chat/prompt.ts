import { getConfig } from '@/lib/config-loader';
import { buildSystemPrompt } from '@/lib/system-prompt';

export const SYSTEM_PROMPT = {
  role: 'system' as const,
  content: buildSystemPrompt(getConfig()),
};
