'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Briefcase, Mail, Users, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getConfig } from '@/lib/config-loader';
import { useLocalTime } from '@/hooks/use-local-time';
import { CopyEmail } from '@/components/artifact/copy-email';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The one place every "Hire me" leads: availability up top, then the three
 * ways to start — Upwork, email, or a whole team through Eaglix. A bottom
 * sheet on phones, a centred dialog above. Esc or the scrim closes it.
 */
export function HireSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { personal, availability, social, agency } = getConfig();
  const time = useLocalTime(personal.timezone);
  const city = personal.location.split(',')[0];
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => closeRef.current?.focus(), 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      returnTo?.focus?.();
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  const steps = [
    'Send the shape of your project — a few lines is enough.',
    'I reply within 0–4 hours with questions and an honest fit check.',
    'We start on Upwork or directly, in small reviewable slices.',
  ];

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="hire-sheet"
          className="fixed inset-0 z-[120] flex items-end justify-center sm:items-start sm:px-6 sm:pt-[8vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.18 }}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[#0b151b]/45 dark:bg-black/65"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hire-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16, transition: { duration: 0.15 } }}
            transition={{ duration: 0.26, ease: EASE }}
            className="scrollbar-subtle relative max-h-[92svh] w-full overflow-y-auto rounded-t-xl border border-transparent bg-card pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-float)] sm:max-w-xl sm:rounded-xl"
          >
            {/* Grabber (phones) */}
            <div aria-hidden className="flex justify-center pt-2 sm:hidden">
              <span className="h-1 w-9 rounded-full bg-border-strong" />
            </div>

            <div className="flex items-start justify-between gap-4 px-5 pt-4 sm:px-7 sm:pt-6">
              <div className="min-w-0">
                <p className="meta flex items-center gap-2 text-muted-foreground">
                  {availability.open && <span className="status-dot" aria-hidden />}
                  {availability.open ? 'Taking new work' : 'Currently booked'}
                </p>
                <h2
                  id="hire-title"
                  className="font-display mt-2 text-[2.5rem] leading-[1.05] text-foreground"
                >
                  Let&apos;s work together.
                </h2>
                <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">
                  {availability.headline}. Replies in 0–4 hours
                  {time ? (
                    <>
                      {' '}— it&apos;s{' '}
                      <span className="num text-foreground" suppressHydrationWarning>
                        {time.label}
                      </span>{' '}
                      in {city}.
                    </>
                  ) : (
                    '.'
                  )}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="press -mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Three ways in */}
            <ul className="mt-5 border-t border-border">
              <li className="border-b border-border-subtle">
                <a
                  href={social.upwork}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-sunken sm:px-7"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-clay text-clay-foreground">
                    <Briefcase className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-[16px] font-semibold text-foreground">
                      Hire me on Upwork
                      <span className="tag !h-5 !border-clay/30 !bg-clay-soft !text-clay-ink">
                        Recommended
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[16px] leading-snug text-muted-foreground">
                      {personal.upworkBadge} · contracts and payments protected
                      by Upwork.
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-clay"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>

              <li className="flex flex-wrap items-start gap-4 border-b border-border-subtle px-5 py-4 sm:px-7">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-sunken text-foreground">
                  <Mail className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold text-foreground">
                    Email me directly
                  </span>
                  <a
                    href={`mailto:${personal.email}?subject=${encodeURIComponent('Project enquiry')}`}
                    className="num mt-0.5 block truncate text-[16px] text-ink-soft underline decoration-border-strong underline-offset-4 hover:text-foreground hover:decoration-clay"
                  >
                    {personal.email}
                  </a>
                </span>
                <CopyEmail email={personal.email} label="Copy" />
              </li>

              <li>
                <a
                  href={agency.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-sunken sm:px-7"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-sunken text-foreground">
                    <Users className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-semibold text-foreground">
                      Need a team? {agency.name}
                    </span>
                    <span className="mt-0.5 block text-[16px] leading-snug text-muted-foreground">
                      The agency I founded — Ethiopian engineers for
                      team-sized builds in software and AI automation.
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden
                    className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-clay"
                  />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            </ul>

            {/* What happens next */}
            <div className="border-t border-border bg-sunken px-5 py-4 sm:px-7">
              <p className="meta mb-2.5 text-muted-foreground">What happens next</p>
              <ol className="space-y-1.5">
                {steps.map((s, i) => (
                  <li key={s} className="flex gap-3 text-[16px] leading-snug text-ink-soft">
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default HireSheet;
