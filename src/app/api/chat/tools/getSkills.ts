import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getSkills = tool({
  description:
    'Provides a structured overview of technical skills and engineering practices across the full stack and AI/LLM work.',
  inputSchema: z.object({}),
  execute: async () => {
    const config = getConfig();

    return {
      technicalSkills: {
        languages: config.skills.languages,
        frontend: config.skills.frontend,
        backend: config.skills.backend,
        aiAndLlm: config.skills.ai_llm,
        dataAndMl: config.skills.data_ml,
        cloudAndDevOps: config.skills.cloud_devops,
        databases: config.skills.databases,
        practices: config.skills.practices,
      },
      education: {
        degree: config.education.degree,
        institution: config.education.institution,
        gpa: config.education.gpa,
      },
      message:
        "My core is TypeScript and Python across the full stack — Next.js and NestJS on the product side, and the modern LLM toolchain (LangChain, LangGraph, RAG, RLHF) on the AI side. Beyond the tools, the parts clients value most are system design, code quality, and clear communication.",
    };
  },
});
