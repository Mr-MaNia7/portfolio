import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getInternship = tool({
  description:
    'Provides current availability for freelance and contract work: engagement types, focus areas, start date, and how the work is run. Use for questions about hiring, rates, availability, or working together.',
  inputSchema: z.object({}),
  execute: async () => {
    const config = getConfig();
    const { availability, personal, social } = config;

    return {
      open: availability.open,
      status: availability.headline,
      engagementTypes: availability.types,
      workMode: availability.workMode,
      location: availability.location,
      timezone: availability.timezone,
      startDate: availability.startDate,
      focusAreas: availability.focusAreas,
      workStyle: availability.workStyle,
      goals: availability.goals,
      note: availability.note,
      contact: {
        email: personal.email,
        upwork: social.upwork,
        github: social.github,
        linkedin: social.linkedin,
      },
      message:
        "I'm open to freelance and contract work, remote, and I can flex into US or EU hours. I like owning real surface area — web platforms, AI/LLM features, or both — and I keep communication tight the whole way through. Send me the shape of the project and I'll tell you honestly whether I'm the right fit.",
    };
  },
});
