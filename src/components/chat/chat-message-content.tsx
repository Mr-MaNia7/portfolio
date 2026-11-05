'use client';

import type { UIMessage } from 'ai';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import {
  prepareStreamingMarkdown,
  rehypeStreaming,
} from '@/lib/streaming-markdown';

export type ChatMessageContentProps = {
  message: UIMessage;
  /** The answer is still arriving: new words fade in behind one cursor. */
  streaming?: boolean;
};

const CodeBlock = ({
  content,
  streaming,
}: {
  content: string;
  /** Still being written: the language line may be partial and the cursor sits at its end. */
  streaming?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Extract language if present in the first line. While the first line is still
  // arriving there is no code yet, and a half-written name is not a language.
  const firstLineBreak = content.indexOf('\n');
  const headerDone = firstLineBreak >= 0;
  const firstLine = headerDone ? content.substring(0, firstLineBreak).trim() : '';
  const language = firstLine || 'text';
  const code = headerDone
    ? content.substring(firstLineBreak + 1)
    : streaming
      ? ''
      : content;

  // Get first few lines for preview
  const previewLines = code.split('\n').slice(0, 1).join('\n');
  const hasMoreLines = code.split('\n').length > 1;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="my-5 w-full overflow-hidden rounded-md border border-border bg-sunken"
    >
      <div className="flex items-center justify-between border-b border-border-subtle py-1 pr-1 pl-3.5">
        <span className="meta text-muted-foreground">
          {language !== 'text' ? language : 'code'}
        </span>
        <CollapsibleTrigger
          aria-label={isOpen ? 'Collapse code' : 'Expand code'}
          className="press rounded-sm p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          {isOpen ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </CollapsibleTrigger>
      </div>

      {!isOpen && hasMoreLines ? (
        <pre className="px-4 py-3">
          <code className="font-mono text-[13px] text-ink-soft">
            {previewLines + '\n…'}
          </code>
        </pre>
      ) : (
        <CollapsibleContent>
          <div className="scrollbar-subtle overflow-x-auto">
            <pre className="min-w-max px-4 py-3.5">
              <code className="font-mono text-[13px] leading-relaxed whitespace-pre text-foreground">
                {code}
                {streaming && <span aria-hidden className="stream-cursor" />}
              </code>
            </pre>
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

/** A model-written image: its box is held before it loads, then it fades in. */
const AnswerImage = ({ src, alt }: { src?: string; alt?: string }) => {
  const [loaded, setLoaded] = useState(false);
  if (typeof src !== 'string' || !src) return null;
  return (
    <span className="answer-image">
      {/* eslint-disable-next-line @next/next/no-img-element -- any host the model names; next/image needs them listed */}
      <img
        src={src}
        alt={alt ?? ''}
        loading="lazy"
        data-loaded={loaded}
        onLoad={() => setLoaded(true)}
        className="fade-img"
      />
    </span>
  );
};

const MARKDOWN: Components = {
  p: ({ children }) => <p className="my-3 first:mt-0 last:mb-0">{children}</p>,
  h1: ({ children }) => (
    <h3 className="font-display mt-6 mb-2 text-[1.375rem] leading-tight text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="font-display mt-6 mb-2 text-[1.25rem] leading-tight text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mt-5 mb-1.5 text-[16px] font-medium text-foreground first:mt-0">
      {children}
    </h4>
  ),
  ul: ({ children }) => (
    <ul className="hang my-3 list-disc space-y-1.5 pl-5 marker:text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-medium text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="font-display hang my-4 border-l-2 border-border-strong pl-4 text-[1.125rem] leading-snug text-ink-soft italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-border" />,
  code: ({ children }) => (
    <code className="rounded-sm border border-border-subtle bg-sunken px-1 py-px font-mono text-[0.86em] text-foreground">
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="answer-table scrollbar-subtle my-4 overflow-x-auto rounded-md border border-border">
      <table className="w-full border-collapse text-left text-[14px]">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="meta border-b border-border bg-sunken px-3 py-2 font-normal text-muted-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border-subtle px-3 py-2 align-top tabular-nums">
      {children}
    </td>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-ink underline decoration-brand/40 underline-offset-[3px] transition-colors hover:decoration-brand"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <AnswerImage src={typeof src === 'string' ? src : undefined} alt={alt} />
  ),
};

const STREAMING_PLUGINS = [rehypeStreaming];

export default function ChatMessageContent({
  message,
  streaming = false,
}: ChatMessageContentProps) {
  const parts = message.parts ?? [];
  const lastTextIndex = parts.findLastIndex(
    (part) => part.type === 'text' && part.text
  );

  return (
    <div className="w-full text-[16px] leading-[1.7] text-foreground">
      {parts.map((part, partIndex) => {
        if (part.type !== 'text' || !part.text) return null;

        const live = streaming && partIndex === lastTextIndex;
        // A fence still being opened must not show as stray backticks.
        const source = live ? part.text.replace(/(^|\n)`{1,2}$/, '$1') : part.text;

        // Split content by code block markers. An unclosed fence is an odd last piece,
        // so it already renders as a code block while it is being written.
        const contentParts = source.split('```');

        return (
          <div key={partIndex} className="w-full">
            {contentParts.map((content, i) => {
              const tail = live && i === contentParts.length - 1;
              return i % 2 === 0 ? (
                <div key={`text-${i}`} className="w-full break-words">
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={tail ? STREAMING_PLUGINS : undefined}
                    components={MARKDOWN}
                  >
                    {tail ? prepareStreamingMarkdown(content) : content}
                  </Markdown>
                </div>
              ) : (
                <CodeBlock key={`code-${i}`} content={content} streaming={tail} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
