import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getHobbies = tool({
  description:
    'Shows what I do outside of code: chess (with my chess.com ratings) and football. Use for hobbies, interests, chess, football, or "something interesting about you".',
  inputSchema: z.object({}),
  execute: async () => {
    const { hobbies } = getConfig();

    return {
      intro: hobbies.intro,
      chess: hobbies.chess,
      football: hobbies.football,
      message:
        "Chess and football — both are about reading the position a few moves ahead, which isn't far from what I do at work.",
    };
  },
});
