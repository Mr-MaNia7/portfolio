'use client';

import React, { useId, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Search } from 'lucide-react';
import { getConfig } from '@/lib/config-loader';
import { askPortfolio } from '@/lib/portfolio-events';
import { Artifact, ArtifactHeader, pad2 } from '@/components/artifact/artifact';
import { usePanel } from '@/components/chat/side-panel';

/**
 * Skills as I actually use them: the languages in my hands, then a capability
 * explorer — pick a capability to see what I do, the proof from shipped work,
 * and the tools behind it. A lookup answers "do you work with X?" from
 * everything the config knows I've shipped.
 */
type ToolIndex = Map<
  string,
  { name: string; capabilities: Set<number>; shipped: Set<string> }
>;

/** Every tool → where it shows up: capabilities, projects, roles. Static config, built once. */
function buildToolIndex(): ToolIndex {
  const { skills, projects, experience } = getConfig();
  const map: ToolIndex = new Map();
  const add = (tool: string, shipped?: string, cap?: number) => {
    const key = tool.toLowerCase();
    const entry = map.get(key) ?? {
      name: tool,
      capabilities: new Set<number>(),
      shipped: new Set<string>(),
    };
    if (cap !== undefined) entry.capabilities.add(cap);
    if (shipped) entry.shipped.add(shipped);
    map.set(key, entry);
  };
  skills.capabilities.forEach((c, i) => c.tools.forEach((t) => add(t, undefined, i)));
  // Name the product when the client is anonymous ("Upwork client").
  projects.forEach((p) =>
    p.techStack.forEach((t) =>
      add(
        t,
        p.client && p.client !== 'Upwork client'
          ? p.client
          : p.title.split(' — ')[0]
      )
    )
  );
  experience.forEach((e) => e.technologies.forEach((t) => add(t, e.company)));
  skills.languages.forEach((l) => add(l.name));
  return map;
}

export const TOOL_INDEX = buildToolIndex();

const Skills = () => {
  const { skills } = getConfig();
  const { capabilities, languages } = skills;
  const { detail } = usePanel();
  const [active, setActive] = useState(detail ?? 0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const toolCount = new Set(capabilities.flatMap((c) => c.tools)).size;
  const current = capabilities[active];

  // Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation).
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const last = capabilities.length - 1;
    const next =
      e.key === 'ArrowDown' || e.key === 'ArrowRight'
        ? i === last
          ? 0
          : i + 1
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft'
          ? i === 0
            ? last
            : i - 1
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };


  return (
    <Artifact label="Skills">
      <ArtifactHeader
        kicker="Skills"
        title="What I build, with proof I&apos;ve shipped it"
        standfirst={skills.intro}
        aside={
          <dl className="flex gap-6 @lg:text-right">
            <div className="flex flex-col gap-1">
              <dt className="meta text-muted-foreground">Capabilities</dt>
              <dd className="num order-first text-[1.75rem] leading-none text-foreground">
                {pad2(capabilities.length)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="meta text-muted-foreground">Tools</dt>
              <dd className="num order-first text-[1.75rem] leading-none text-foreground">
                {toolCount}
              </dd>
            </div>
          </dl>
        }
      />

      {/* Languages in my hands */}
      <ul
        aria-label="Languages"
        className="reveal grid grid-cols-2 gap-px border-t border-border bg-border-subtle @2xl:grid-cols-4"
        style={{ '--i': 1 } as React.CSSProperties}
      >
        {languages.map((lang) => (
          <li key={lang.name} className="flex flex-col gap-1.5 bg-sunken px-5 py-4 @lg:px-6">
            <span className="flex items-center justify-between gap-2">
              <span className="font-display text-[1.25rem] leading-none text-foreground">
                {lang.name}
              </span>
              <span
                className={`num flex items-center gap-1.5 text-[13px] ${lang.usage === 'Daily' ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${lang.usage === 'Daily' ? 'bg-foreground' : 'bg-border-strong'}`}
                />
                {lang.usage}
              </span>
            </span>
            <span className="text-[14px] leading-snug text-muted-foreground">
              {lang.note}
            </span>
          </li>
        ))}
      </ul>

      {/* Capability explorer */}
      <div
        className="reveal grid border-t border-border @2xl:grid-cols-[15.5rem_1fr]"
        style={{ '--i': 2 } as React.CSSProperties}
      >
        <div
          role="tablist"
          aria-label="Capabilities"
          aria-orientation="vertical"
          className="scrollbar-none flex gap-1.5 overflow-x-auto border-b border-border-subtle bg-sunken px-5 py-3 @2xl:flex-col @2xl:gap-0 @2xl:overflow-visible @2xl:border-r @2xl:border-b-0 @2xl:p-0"
        >
          {capabilities.map((cap, i) => {
            const selected = i === active;
            return (
              <button
                key={cap.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`${baseId}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`press group flex shrink-0 items-baseline gap-3 rounded-md border px-3 py-2 text-left text-[14px] whitespace-nowrap transition-colors @2xl:rounded-none @2xl:border-0 @2xl:border-l-2 @2xl:px-5 @2xl:py-3 @2xl:whitespace-normal ${
                  selected
                    ? 'border-border-strong bg-card text-foreground @2xl:border-border-strong'
                    : 'border-border bg-transparent text-ink-soft hover:text-foreground @2xl:border-transparent @2xl:hover:bg-card/60'
                }`}
              >
                <span
                  className={`num text-[13px] ${selected ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {pad2(i + 1)}
                </span>
                <span className={selected ? 'font-medium' : ''}>{cap.name}</span>
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${active}`}
          className="min-w-0 px-5 py-6 @lg:px-7"
        >
          {/* Keyed so the panel re-reveals on every switch */}
          <div key={current.id} className="swap">
            <p className="meta text-muted-foreground">
              Capability <span className="num">{pad2(active + 1)}</span>
              <span className="text-border-strong"> / {pad2(capabilities.length)}</span>
            </p>
            <h3 className="font-display mt-2 text-[1.625rem] leading-[1.1] text-foreground @lg:text-[1.875rem]">
              {current.name}
            </h3>
            <p className="measure mt-2.5 text-[16px] leading-relaxed text-ink-soft">
              {current.summary}
            </p>

            <p className="meta mt-6 mb-2.5 text-muted-foreground">Proof</p>
            <ul>
              {current.proof.map((p) => (
                <li
                  key={p}
                  className="border-b border-border-subtle py-2.5 text-[16px] leading-snug text-foreground first:pt-0 last:border-b-0 last:pb-0"
                >
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-5 @lg:grid-cols-[auto_1fr] @lg:gap-8">
              <div>
                <p className="meta mb-2 text-muted-foreground">Shipped at</p>
                <ul className="flex flex-wrap gap-1.5">
                  {current.shippedAt.map((s) => (
                    <li key={s} className="tag tag--line">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="meta mb-2 text-muted-foreground">Tools</p>
                <ul className="flex flex-wrap gap-1">
                  {current.tools.map((t) => (
                    <li key={t} className="tag">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                askPortfolio(
                  `How did you do "${current.name}" at ${current.shippedAt[0]}? Walk me through it.`,
                  true
                )
              }
              className="text-btn mt-5"
            >
              Ask my twin how I did it
              <ArrowRight className="text-btn__arrow h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <ToolLookup
        index={TOOL_INDEX}
        onPick={(cap) => {
          setActive(cap);
          tabRefs.current[cap]?.focus();
        }}
        capabilityNames={capabilities.map((c) => c.name)}
      />
    </Artifact>
  );
};

/** "Do you work with…?" — answered from the config, never guessed. */
export function ToolLookup({
  index,
  onPick,
  capabilityNames,
  plain = false,
}: {
  index: ToolIndex;
  onPick: (capability: number, opener: HTMLElement) => void;
  capabilityNames: string[];
  /** Inside a card that already has its own frame. */
  plain?: boolean;
}) {
  const [query, setQuery] = useState('');
  const inputId = useId();
  const listId = useId();
  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (q.length < 2) return [];
    return [...index.entries()]
      .filter(([key]) => key.includes(q))
      .sort(([a], [b]) => Number(b === q) - Number(a === q) || a.length - b.length)
      .slice(0, 3)
      .map(([, v]) => v);
  }, [index, q]);

  const suggestions = ['Supabase', 'Kubernetes', 'Go', 'OpenTelemetry', 'Next.js'];

  return (
    <div
      className={plain ? '' : 'reveal border-t border-border bg-sunken px-5 py-5 @lg:px-7'}
      style={plain ? undefined : ({ '--i': 3 } as React.CSSProperties)}
    >
      <label htmlFor={inputId} className="meta text-muted-foreground">
        Do you work with…?
      </label>
      <div className="relative mt-2">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          id={inputId}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a technology — e.g. Terraform"
          autoComplete="off"
          aria-describedby={listId}
          className="h-11 w-full rounded-md border border-border-strong bg-card pr-3 pl-9 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none"
        />
      </div>

      <div id={listId} aria-live="polite" className="mt-3 min-h-[1.75rem]">
        {q.length < 2 ? (
          <p className="flex flex-wrap items-center gap-1.5 text-[14px] text-muted-foreground">
            Try
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="press tag tag--raised"
              >
                {s}
              </button>
            ))}
          </p>
        ) : matches.length ? (
          <ul className="space-y-2.5">
            {matches.map((m) => (
              <li key={m.name} className="flex gap-2.5 text-[16px] leading-snug">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                <span className="min-w-0 text-foreground">
                  <span className="font-medium">Yes — {m.name}.</span>{' '}
                  {m.shipped.size > 0 && (
                    <span className="text-ink-soft">
                      Shipped at {[...m.shipped].slice(0, 4).join(', ')}.
                    </span>
                  )}{' '}
                  {[...m.capabilities].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={(e) => onPick(c, e.currentTarget)}
                      className="press mr-1.5 inline-flex items-center gap-1 text-[14px] text-brand-ink underline decoration-brand/40 underline-offset-4 hover:decoration-brand"
                    >
                      {capabilityNames[c]}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[16px] text-ink-soft">
            Not on my list — I&apos;d rather tell you honestly than pad it.
            <button
              type="button"
              onClick={() =>
                askPortfolio(
                  `Have you worked with ${query.trim()}, or anything close to it?`,
                  true
                )
              }
              className="btn btn--secondary"
            >
              Ask me about {query.trim()}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default Skills;
