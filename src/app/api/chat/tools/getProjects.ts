import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getProjects = tool({
  description:
    'Showcases the project portfolio — real client and research work with the stack, role, and measurable impact.',
  inputSchema: z.object({}),
  execute: async () => {
    const config = getConfig();

    return {
      projects: config.projects.map((project) => ({
        title: project.title,
        category: project.category,
        role: project.role,
        client: project.client,
        date: project.date,
        description: project.description,
        techStack: project.techStack,
        status: project.status,
        featured: project.featured,
        links: project.links,
        highlights: project.highlights || [],
        metrics: project.metrics || [],
      })),
      summary:
        "Here's a cross-section of my work — fintech backends, an AI call-management system, frontier-model training, and published NLP research. Different domains, but the through-line is the same: own it end to end and ship something that measurably works. Ask me about any one and I'll go deeper.",
    };
  },
});
