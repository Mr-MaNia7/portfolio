import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getPresentation = tool({
  description:
    'Provides a professional introduction and personal background — who I am, what I do, and how I got here.',
  parameters: z.object({}),
  execute: async () => {
    const config = getConfig();

    return {
      presentation: config.personal.bio,
      name: config.personal.name,
      title: config.personal.title,
      tagline: config.personal.tagline,
      location: config.personal.location,
      standing: config.personal.upworkBadge,
      stats: config.stats,
      education: {
        degree: config.education.degree,
        institution: config.education.institution,
        gpa: config.education.gpa,
      },
      message:
        "Short version: I'm a senior full-stack engineer who spends most of his time where web meets AI. I build the whole thing — architecture, backend, front end, and the LLM layer — and I've been doing it for global clients as a Top Rated freelancer for years.",
    };
  },
});
