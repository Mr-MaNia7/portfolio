import type { DynamicToolUIPart, ToolUIPart, UIMessage } from 'ai';

// Local copies of the AI SDK's part helpers. Importing them from 'ai' would pull its
// runtime, and the stream schemas with it, into the landing page's first load.
type Part = UIMessage['parts'][number];

export const isToolUIPart = (part: Part): part is ToolUIPart | DynamicToolUIPart =>
  part.type.startsWith('tool-') || part.type === 'dynamic-tool';

export const getToolName = (part: ToolUIPart | DynamicToolUIPart): string =>
  part.type === 'dynamic-tool' ? part.toolName : part.type.split('-').slice(1).join('-');

export const textOf = (m: UIMessage) =>
  (m.parts ?? [])
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('');

/** Something the visitor can see: words, or a tool that was actually called. */
export const hasContent = (m: UIMessage) =>
  textOf(m).trim().length > 0 || (m.parts ?? []).some(isToolUIPart);
