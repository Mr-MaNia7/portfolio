import type { PortfolioConfig } from '@/types/portfolio';

export type CommandKind = 'ask' | 'link' | 'copy' | 'theme' | 'resume';

export interface Command {
  id: string;
  label: string;
  hint?: string;
  slash?: string;
  keywords: string[];
  group: 'Ask' | 'Elsewhere' | 'Actions';
  kind: CommandKind;
  payload?: string;
  icon: string;
}

/**
 * Build the command set from portfolio config. These power both the ⌘K
 * palette and the in-input slash menu, so the two never drift apart.
 * `ask` payloads must match preset-reply keys exactly for instant answers.
 */
export function buildCommands(config: PortfolioConfig): Command[] {
  const { social, personal } = config;

  const ask: Command[] = [
    {
      id: 'about',
      label: 'Who are you?',
      hint: 'Intro & background',
      slash: '/about',
      keywords: ['about', 'intro', 'bio', 'who', 'yourself'],
      group: 'Ask',
      kind: 'ask',
      payload: 'Who are you?',
      icon: 'user',
    },
    {
      id: 'projects',
      label: 'What projects are you most proud of?',
      hint: 'Selected work',
      slash: '/projects',
      keywords: ['projects', 'work', 'portfolio', 'built', 'case'],
      group: 'Ask',
      kind: 'ask',
      payload: 'What projects are you most proud of?',
      icon: 'folder',
    },
    {
      id: 'skills',
      label: 'What are your skills?',
      hint: 'Stack & practices',
      slash: '/skills',
      keywords: ['skills', 'stack', 'tech', 'tools', 'expertise'],
      group: 'Ask',
      kind: 'ask',
      payload: 'What are your skills?',
      icon: 'layers',
    },
    {
      id: 'resume',
      label: 'Can I see your résumé?',
      hint: 'Experience & download',
      slash: '/resume',
      keywords: ['resume', 'résumé', 'cv', 'experience', 'history'],
      group: 'Ask',
      kind: 'ask',
      payload: 'Can I see your résumé?',
      icon: 'file',
    },
    {
      id: 'availability',
      label: 'Are you available for work?',
      hint: 'Freelance & contract',
      slash: '/hire',
      keywords: ['hire', 'available', 'availability', 'work', 'freelance', 'rate'],
      group: 'Ask',
      kind: 'ask',
      payload: 'Are you available for work?',
      icon: 'briefcase',
    },
    {
      id: 'contact',
      label: 'How can I reach you?',
      hint: 'Email & profiles',
      slash: '/contact',
      keywords: ['contact', 'reach', 'email', 'connect', 'hire'],
      group: 'Ask',
      kind: 'ask',
      payload: 'How can I reach you?',
      icon: 'mail',
    },
  ];

  const links: Command[] = [
    social.upwork && {
      id: 'upwork',
      label: 'Upwork profile',
      hint: 'Top Rated Plus',
      slash: '/upwork',
      keywords: ['upwork', 'freelance', 'hire'],
      group: 'Elsewhere' as const,
      kind: 'link' as const,
      payload: social.upwork,
      icon: 'external',
    },
    social.github && {
      id: 'github',
      label: 'GitHub',
      slash: '/github',
      keywords: ['github', 'code', 'source'],
      group: 'Elsewhere' as const,
      kind: 'link' as const,
      payload: social.github,
      icon: 'github',
    },
    social.linkedin && {
      id: 'linkedin',
      label: 'LinkedIn',
      slash: '/linkedin',
      keywords: ['linkedin', 'profile'],
      group: 'Elsewhere' as const,
      kind: 'link' as const,
      payload: social.linkedin,
      icon: 'linkedin',
    },
    social.twitter && {
      id: 'twitter',
      label: 'X / Twitter',
      slash: '/x',
      keywords: ['x', 'twitter', 'social'],
      group: 'Elsewhere' as const,
      kind: 'link' as const,
      payload: social.twitter,
      icon: 'twitter',
    },
  ].filter(Boolean) as Command[];

  const actions: Command[] = [
    {
      id: 'copy-email',
      label: 'Copy email address',
      hint: personal.email,
      slash: '/email',
      keywords: ['email', 'copy', 'mail'],
      group: 'Actions',
      kind: 'copy',
      payload: personal.email,
      icon: 'copy',
    },
    {
      id: 'download-resume',
      label: 'Download résumé (PDF)',
      slash: '/download',
      keywords: ['download', 'resume', 'résumé', 'pdf', 'cv'],
      group: 'Actions',
      kind: 'resume',
      icon: 'download',
    },
    {
      id: 'theme',
      label: 'Toggle light / dark',
      slash: '/theme',
      keywords: ['theme', 'dark', 'light', 'mode'],
      group: 'Actions',
      kind: 'theme',
      icon: 'theme',
    },
  ];

  return [...ask, ...links, ...actions];
}
