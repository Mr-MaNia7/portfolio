import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getResume = tool({
  description:
    'Provides résumé information — professional experience, education, research, and a downloadable résumé.',
  parameters: z.object({}),
  execute: async () => {
    const config = getConfig();

    return {
      personalInfo: {
        name: config.personal.name,
        email: config.personal.email,
        location: config.personal.location,
        title: config.personal.title,
        standing: config.personal.upworkBadge,
        profiles: {
          upwork: config.social.upwork,
          github: config.social.github,
          linkedin: config.social.linkedin,
        },
      },
      summary: config.personal.bio,
      education: {
        degree: config.education.degree,
        institution: config.education.institution,
        stream: config.education.stream,
        gpa: config.education.gpa,
        research: config.education.research,
        achievements: config.education.achievements,
      },
      experience: config.experience.map((exp) => ({
        company: exp.company,
        position: exp.position,
        duration: exp.duration,
        type: exp.type,
        description: exp.description,
        highlights: exp.highlights,
        technologies: exp.technologies,
      })),
      skills: config.skills,
      resume: {
        title: config.resume.title,
        description: config.resume.description,
        lastUpdated: config.resume.lastUpdated,
        downloadUrl: config.resume.downloadUrl,
      },
      message:
        "Here's the full picture — five years across fintech, telecom, and AI training, plus published research. The résumé card has the download; happy to expand on any role.",
    };
  },
});
