'use client';

import { Check, Copy, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * The quiet row under a message: Instant or Live, then Copy and Remove. The row's
 * height is always reserved, so revealing the buttons moves nothing.
 */
export function MessageActions({
  getText,
  onRemove,
  removeLabel,
  label,
  labelTitle,
  align = 'start',
  canCopy = true,
}: {
  getText: () => string;
  onRemove?: () => void;
  removeLabel: string;
  label?: string;
  labelTitle?: string;
  align?: 'start' | 'end';
  /** Nothing to copy from an answer stopped before its first word. */
  canCopy?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = () => {
    navigator.clipboard
      ?.writeText(getText())
      .then(() => setCopied(true))
      .catch(() => toast.error('Could not copy'));
  };

  return (
    <div className={`msg-actions ${align === 'end' ? 'msg-actions--end' : ''}`}>
      {label && (
        <span className="msg-actions__label" title={labelTitle}>
          {label}
        </span>
      )}
      <div className="msg-actions__btns">
        {canCopy && (
          <button type="button" onClick={copy} className="msg-action">
            {copied ? (
              <Check className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={removeLabel}
            className="msg-action"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
