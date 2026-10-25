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
        "AIVI leads: a multi-region AI voice platform I've shipped 500+ PRs into. Then Svetness's rebuilt operations platform, Aladia's learning platform, and earlier work across fintech, call centers, frontier-model training and NLP research. Ask me about any one and I'll go deeper.",
    };
  },
});
