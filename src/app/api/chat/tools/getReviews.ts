import { tool } from 'ai';
import { z } from 'zod';
import { getConfig } from '@/lib/config-loader';

export const getReviews = tool({
  description:
    'Shows verbatim client reviews and ratings from Upwork. Use when the visitor asks what clients say, for testimonials, references, or track record.',
  inputSchema: z.object({}),
  execute: async () => {
    const { reviews } = getConfig();

    return {
      rating: reviews.rating,
      summary: reviews.summary,
      ratings: reviews.ratings,
      quotes: reviews.quotes,
      endorsements: reviews.endorsements,
      source: reviews.source,
      message:
        "These are my clients' own words, copied verbatim from Upwork — plus 5.0 ratings from AIVI, Svetness and Aladia.",
    };
  },
});
