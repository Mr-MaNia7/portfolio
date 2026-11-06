import { isToolUIPart, type UIMessage } from 'ai';

export const textOf = (m: UIMessage) =>
  (m.parts ?? [])
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('');

/** Something the visitor can see: words, or a tool that was actually called. */
export const hasContent = (m: UIMessage) =>
  textOf(m).trim().length > 0 || (m.parts ?? []).some(isToolUIPart);
