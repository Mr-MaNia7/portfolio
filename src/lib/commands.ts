import type { PortfolioConfig } from '@/types/portfolio';

export type CommandKind = 'ask' | 'link' | 'copy' | 'theme' | 'resume' | 'hire';

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
  const { social, personal, agency } = config;

  const ask: Command[] = [
    {
      id: 'about',
      label: 'Why should I consider you?',
      hint: 'Intro & background',
      slash: '/about',
      keywords: ['about', 'intro', 'bio', 'who', 'yourself'],
      group: 'Ask',
      kind: 'ask',
      payload: 'Why should I consider you?',
      icon: 'user',
    },
    {
      id: 'projects',
      label: 'What have you shipped?',
      hint: 'Selected work',
      slash: '/projects',
      keywords: ['projects', 'work', 'portfolio', 'built', 'case'],
      group: 'Ask',
      kind: 'ask',
      payload: 'What have you shipped?',
      icon: 'folder',
    },
    {
      id: 'skills',
      label: 'Can you handle my stack?',
      hint: 'Stack & practices',
      slash: '/skills',
      keywords: ['skills', 'stack', 'tech', 'tools', 'expertise'],
      group: 'Ask',
      kind: 'ask',
      payload: 'Can you handle my stack?',
      icon: 'layers',
    },
    {
      id: 'reviews',
      label: 'What do past clients say?',
      hint: 'Verbatim Upwork reviews',
      slash: '/reviews',
      keywords: ['reviews', 'testimonials', 'clients', 'feedback', 'rating', 'upwork'],
      group: 'Ask',
      kind: 'ask',
      payload: 'What do past clients say?',
      icon: 'quote',
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
      label: 'How soon can you start?',
      hint: 'Freelance & contract',
      slash: '/availability',
      keywords: ['available', 'availability', 'work', 'freelance', 'contract', 'rate'],
      group: 'Ask',
      kind: 'ask',
      payload: 'How soon can you start?',
      icon: 'briefcase',
    },
    {
      id: 'contact',
      label: 'How do we get started?',
      hint: 'Email & profiles',
      slash: '/contact',
      keywords: ['contact', 'reach', 'email', 'connect', 'hire'],
      group: 'Ask',
      kind: 'ask',
      payload: 'How do we get started?',
      icon: 'mail',
    },
    {
      id: 'hobbies',
      label: 'What are you like outside work?',
      hint: 'Chess & football',
      slash: '/hobbies',
      keywords: ['hobbies', 'fun', 'chess', 'football', 'soccer', 'outside', 'personal'],
      group: 'Ask',
      kind: 'ask',
      payload: 'What are you like outside work?',
      icon: 'chess',
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
    agency.url && {
      id: 'agency',
      label: `${agency.name} — need a team?`,
      hint: 'The agency I founded',
      slash: '/team',
      keywords: ['team', 'agency', 'eaglix', 'company', 'big', 'project'],
      group: 'Elsewhere' as const,
      kind: 'link' as const,
      payload: agency.url,
      icon: 'users',
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
      id: 'hire',
      label: 'Hire me',
      hint: 'Upwork, email or a team',
      slash: '/hire',
      keywords: ['hire', 'book', 'call', 'start', 'project', 'contract', 'work together'],
      group: 'Actions',
      kind: 'hire',
      icon: 'briefcase',
    },
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
