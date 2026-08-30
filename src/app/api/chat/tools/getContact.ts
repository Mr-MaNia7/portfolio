import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getContact = tool({
  description:
    'Provides professional contact information and links (email, Upwork, GitHub, LinkedIn, X).',
  parameters: z.object({}),
  execute: async () => {
    const config = getConfig();

    return {
      name: config.personal.name,
      email: config.personal.email,
      location: config.personal.location,
      timezone: config.personal.timezone,
      availability: config.availability.headline,
      socialProfiles: {
        upwork: config.social.upwork,
        github: config.social.github,
        linkedin: config.social.linkedin,
        twitter: config.social.twitter,
      },
      message:
        "The fastest way to reach me is email — I read everything and reply quickly. I'm also Top Rated Plus on Upwork (100% Job Success) if you'd rather run the engagement through there. Tell me a little about what you're building and I'll come back with concrete next steps.",
    };
  },
});
