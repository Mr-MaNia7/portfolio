import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getInternship = tool({
  description:
    'Provides current availability for freelance and contract work: engagement types, focus areas, start date, and how the work is run. Use for questions about hiring, rates, availability, or working together.',
  inputSchema: z.object({}),
  execute: async () => {
    const config = getConfig();
    const { availability, personal, social, agency } = config;

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
      agency: { name: agency.name, url: agency.url, pitch: agency.pitch },
      message:
        "I'm open to contract work, part-time or full-time, remote and overlapping US or EU hours. I like owning real surface area — the platform, the AI, or both. If the project needs a whole team, my agency Eaglix Tech can staff it. Send me the shape of the project and I'll tell you honestly whether I'm the right fit.",
    };
  },
});
