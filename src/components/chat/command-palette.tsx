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
  Github,
  Layers,
  Linkedin,
  Mail,
  MoonStar,
  Search,
  Twitter,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => {
      const hay = `${c.label} ${c.hint ?? ''} ${c.slash ?? ''} ${c.keywords.join(
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
      setQuery('');
      setActive(0);
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
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
        setActive((a) => Math.min(a + 1, flat.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = flat[active];
        if (cmd) onRun(cmd);
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.19, 1, 0.22, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-lg border border-border-strong bg-popover"
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
          >
            {/* Search */}
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question or jump to…"
                className="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <kbd className="hidden rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="custom-scrollbar max-h-[52vh] overflow-y-auto p-1.5"
            >
              {flat.length === 0 && (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Nothing matches “{query}”. Try{' '}
                  <span className="text-foreground">projects</span> or{' '}
                  <span className="text-foreground">contact</span>.
                </div>
              )}

              {groups.map(({ group, items }) => (
                <div key={group} className="mb-1">
                  <div className="px-3 pt-2 pb-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                    {group}
                  </div>
                  {items.map((cmd) => {
                    runningIndex += 1;
                    const index = runningIndex;
                    const Icon = ICONS[cmd.icon] ?? CommandIcon;
                    const isActive = index === active;
                    return (
                      <button
                        key={cmd.id}
                        data-index={index}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => onRun(cmd)}
                        className={`flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors ${
                          isActive
                            ? 'bg-secondary text-foreground'
                            : 'text-foreground/80'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate">{cmd.label}</span>
                        {cmd.hint && (
                          <span className="hidden shrink-0 truncate text-xs text-muted-foreground sm:block">
                            {cmd.hint}
                          </span>
                        )}
                        {cmd.slash && (
                          <span className="shrink-0 font-mono text-[11px] text-muted-foreground/70">
                            {cmd.slash}
                          </span>
                        )}
                        {isActive && (
                          <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CommandIcon className="h-3 w-3" />
                <span className="font-mono">Abdulkarim · command menu</span>
              </span>
              <span className="hidden items-center gap-3 sm:flex">
                <span className="flex items-center gap-1">
                  <kbd className="rounded-sm border border-border px-1 font-mono">↑</kbd>
                  <kbd className="rounded-sm border border-border px-1 font-mono">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded-sm border border-border px-1 font-mono">↵</kbd>
                  select
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
