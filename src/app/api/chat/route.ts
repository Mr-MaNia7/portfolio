import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { convertToModelMessages, smoothStream, stepCountIs, streamText } from 'ai';

import { SYSTEM_PROMPT } from './prompt';
import { getContact } from './tools/getContact';
import { getHobbies } from './tools/getHobbies';
import { getInternship } from './tools/getIntership';
import { getProjects } from './tools/getProjects';
import { getResume } from './tools/getResume';
import { getReviews } from './tools/getReviews';
import { getSkills } from './tools/getSkills';

export const maxDuration = 30;

// Create Google AI provider with explicit API key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// ❌ Pas besoin de l'export ici, Next.js n'aime pas ça
function errorHandler(error: unknown) {
  if (error == null) {
    return 'Unknown error';
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('[CHAT-API] Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
      return new Response('Missing API key', { status: 500 });
    }

    // Add tools. Note: getPresentation (the "about" identity card) is
    // intentionally NOT exposed to the live model — that card is the /about
    // preset's job. When the live AI is asked "who are you", it should give a
    // real, generated prose answer rather than re-rendering the curated card.
    const tools = {
      getProjects,
      getResume,
      getContact,
      getSkills,
      getInternship,
      getReviews,
      getHobbies,
    };

    const result = streamText({
      // Gemini 1.5 was retired from the API; 2.5 Flash is the current stable,
      // fast, tool-capable model. Use 'gemini-flash-latest' to auto-track newer
      // stable Flash releases instead of pinning.
      model: google('gemini-2.5-flash-lite'),
      system: SYSTEM_PROMPT.content,
      // A stopped answer can leave a tool call with no result; it must not break the next turn.
      messages: await convertToModelMessages(messages, {
        ignoreIncompleteToolCalls: true,
      }),
      tools,
      stopWhen: stepCountIs(2),
      // The free tier is small. A failed call is reported once, not tried three times:
      // retrying a rate limit only spends more of the quota that ran out.
      maxRetries: 0,
      // The visitor pressing stop also stops the model, so it stops spending quota.
      abortSignal: req.signal,
      // The model sends bursts. Release them word by word so the text arrives evenly.
      experimental_transform: smoothStream({ delayInMs: 18, chunking: 'word' }),
    });

    return result.toUIMessageStreamResponse({
      onError: errorHandler,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Handle specific error types
    if (error instanceof Error && error.message?.includes('quota')) {
      return new Response('API quota exceeded. Please try again later.', { status: 429 });
    }
    
    if (error instanceof Error && error.message?.includes('network')) {
      return new Response('Network error. Please check your connection and try again.', { status: 503 });
    }
    
    // The details stay in the server log; the visitor only needs to know it failed.
    return new Response('Something went wrong. Please try again.', { status: 500 });
  }
}
