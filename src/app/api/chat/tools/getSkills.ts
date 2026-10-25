import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getSkills = tool({
  description:
    'Shows what I build for clients — capabilities with proof from shipped work and the tools behind each — plus the languages I use.',
  inputSchema: z.object({}),
  execute: async () => {
    const config = getConfig();

    return {
      intro: config.skills.intro,
      languages: config.skills.languages,
      capabilities: config.skills.capabilities,
      education: {
        degree: config.education.degree,
        institution: config.education.institution,
        gpa: config.education.gpa,
      },
      message:
        "My core is TypeScript, Python and Go on Supabase and Postgres. Day to day that means multi-tenant backends, multi-region infrastructure on Kubernetes and Terraform, voice AI, and the security and SOC 2 work that lets enterprises buy what I build.",
    };
  },
});
