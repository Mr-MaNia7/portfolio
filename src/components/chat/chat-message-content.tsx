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

export type ChatMessageContentProps = {
  message: UIMessage;
  isLast?: boolean;
  isLoading?: boolean;
  reload?: () => void;
  addToolResult?: (args: { toolCallId: string; result: string }) => void;
  skipToolRendering?: boolean;
};

const CodeBlock = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Extract language if present in the first line
  const firstLineBreak = content.indexOf('\n');
  const firstLine = content.substring(0, firstLineBreak).trim();
  const language = firstLine || 'text';
  const code = firstLine ? content.substring(firstLineBreak + 1) : content;

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
              </code>
            </pre>
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
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
    <h4 className="mt-5 mb-1.5 text-[15px] font-semibold text-foreground first:mt-0">
      {children}
    </h4>
  ),
  ul: ({ children }) => (
    <ul className="hang my-3 list-disc space-y-1.5 pl-5 marker:text-clay">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:font-mono marker:text-[13px] marker:text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="font-display text-[1.05em] italic">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="font-display hang my-4 border-l-2 border-clay pl-4 text-[1.125rem] leading-snug text-ink-soft italic">
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
    <div className="scrollbar-subtle my-4 overflow-x-auto rounded-md border border-border">
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
      className="text-clay-ink underline decoration-clay/40 underline-offset-[3px] transition-colors hover:decoration-clay"
    >
      {children}
    </a>
  ),
};

export default function ChatMessageContent({
  message,
}: ChatMessageContentProps) {
  return (
    <div className="measure w-full text-[15.5px] leading-[1.7] text-foreground">
      {message.parts?.map((part, partIndex) => {
        if (part.type !== 'text' || !part.text) return null;

        // Split content by code block markers
        const contentParts = part.text.split('```');

        return (
          <div key={partIndex} className="w-full">
            {contentParts.map((content, i) =>
              i % 2 === 0 ? (
                <div key={`text-${i}`} className="w-full break-words">
                  <Markdown remarkPlugins={[remarkGfm]} components={MARKDOWN}>
                    {content}
                  </Markdown>
                </div>
              ) : (
                <CodeBlock key={`code-${i}`} content={content} />
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
