'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/** Copies an address to the clipboard with a toast and a brief ✓ on the key. */
export function CopyEmail({
  email,
  className,
  label = 'Copy email',
}: {
  email: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = () => {
    navigator.clipboard
      ?.writeText(email)
      .then(() => {
        setCopied(true);
        toast.success('Email copied', { description: email });
      })
      .catch(() => toast.error('Could not copy — select the address instead'));
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Email copied' : `${label}: ${email}`}
      className={cn('btn-line h-9 px-3.5 text-[13px]', className)}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
}
