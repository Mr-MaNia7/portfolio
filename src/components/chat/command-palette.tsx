'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Briefcase,
  Command as CommandIcon,
  Copy,
  CornerDownLeft,
  Download,
  ExternalLink,
  FileText,
  FolderGit2,
  Layers,
  Mail,
  MoonStar,
  Search,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Github, Linkedin, Twitter } from '@/components/ui/brand-icons';
import type { Command } from '@/lib/commands';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  folder: FolderGit2,
  layers: Layers,
  file: FileText,
  mail: Mail,
  briefcase: Briefcase,
  external: ExternalLink,
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  copy: Copy,
  download: Download,
  theme: MoonStar,
};

const EASE = [0.22, 1, 0.36, 1] as const;

interface CommandPaletteProps {
  commands: Command[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRun: (command: Command) => void;
}

export function CommandPalette({
  commands,
  open,
  onOpenChange,
  onRun,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => {
      const hay =
        `${c.label} ${c.hint ?? ''} ${c.slash ?? ''} ${c.keywords.join(
          ' '
        )}`.toLowerCase();
      return hay.includes(q);
    });
  }, [commands, query]);

  const groups = useMemo(() => {
    const order = ['Ask', 'Elsewhere', 'Actions'];
    const map = new Map<string, Command[]>();
    for (const c of filtered) {
      if (!map.has(c.group)) map.set(c.group, []);
      map.get(c.group)!.push(c);
    }
    return order
      .filter((g) => map.has(g))
      .map((g) => ({ group: g, items: map.get(g)! }));
  }, [filtered]);

  // Flat list mirrors visual order for keyboard nav
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setQuery('');
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
    // Hand focus back to whatever opened the menu.
    returnFocusRef.current?.focus?.();
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => (flat.length ? (a + 1) % flat.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) =>
          flat.length ? (a - 1 + flat.length) % flat.length : 0
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = flat[active];
        if (cmd) onRun(cmd);
      } else if (e.key === 'Tab') {
        // Keep focus inside the dialog: the search field is its only stop.
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, flat, active, onOpenChange, onRun]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  let runningIndex = -1;
  const activeId = flat[active] ? `cmd-${flat[active].id}` : undefined;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.14 } }}
          transition={{ duration: 0.16 }}
        >
          <div
            className="absolute inset-0 bg-[#141413]/30 dark:bg-black/55"
            onClick={() => onOpenChange(false)}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: 4,
              scale: 0.985,
              transition: { duration: 0.14 },
            }}
            transition={{ duration: 0.2, ease: EASE }}
            style={{ transformOrigin: '50% 0%' }}
            className="relative w-full max-w-xl overflow-hidden rounded-lg border border-border-strong bg-popover shadow-[var(--shadow-float)]"
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
          >
            {/* Search */}
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question or jump to…"
                role="combobox"
                aria-expanded="true"
                aria-controls="cmd-listbox"
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                className="h-[3.25rem] w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none"
              />
              <kbd className="kbd hidden sm:inline-flex">esc</kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              id="cmd-listbox"
              role="listbox"
              aria-label="Commands"
              className="scrollbar-subtle max-h-[52vh] overflow-y-auto p-1.5"
            >
              {flat.length === 0 && (
                <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Nothing matches “{query}”. Try{' '}
                  <span className="text-foreground">projects</span> or{' '}
                  <span className="text-foreground">contact</span>.
                </div>
              )}

              {groups.map(({ group, items }) => (
                <div
                  key={group}
                  role="group"
                  aria-label={group}
                  className="mb-1 last:mb-0"
                >
                  <div className="meta px-3 pt-2.5 pb-1.5 text-muted-foreground">
                    {group}
                  </div>
                  {items.map((cmd) => {
                    runningIndex += 1;
                    const index = runningIndex;
                    const Icon = ICONS[cmd.icon] ?? CommandIcon;
                    const isActive = index === active;
                    return (
                      <div
                        key={cmd.id}
                        id={`cmd-${cmd.id}`}
                        role="option"
                        aria-selected={isActive}
                        data-index={index}
                        onMouseMove={() => setActive(index)}
                        onClick={() => onRun(cmd)}
                        className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-[14px] transition-colors duration-150 ${
                          isActive
                            ? 'bg-secondary text-foreground shadow-[inset_2px_0_0_var(--clay)]'
                            : 'text-ink-soft'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${isActive ? 'text-clay' : 'text-muted-foreground'}`}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {cmd.label}
                        </span>
                        {cmd.hint && (
                          <span className="hidden max-w-[12rem] shrink-0 truncate text-[12px] text-muted-foreground sm:block">
                            {cmd.hint}
                          </span>
                        )}
                        {cmd.slash && (
                          <span className="num w-[4.75rem] shrink-0 text-right text-[12px] text-muted-foreground">
                            {cmd.slash}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border-subtle px-4 py-2.5 text-muted-foreground">
              <span className="meta">Command menu</span>
              <span className="hidden items-center gap-3 text-[12px] sm:flex">
                <span className="flex items-center gap-1">
                  <kbd className="kbd">↑</kbd>
                  <kbd className="kbd">↓</kbd>
                  move
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="kbd">
                    <CornerDownLeft className="h-3 w-3" />
                  </kbd>
                  run
                </span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CommandPalette;
