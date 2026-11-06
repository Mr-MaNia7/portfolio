---
title: "The landing page ships as prerendered HTML with no AI SDK in its first load, and only what the visitor asks for loads later"
author: Abdulkarim
date: 2026-11-06
branch: main
id: l-74790439
scope: repo
status: active
replaces: l-dc9d34c2
src: agent
touches:
  - eslint.config.mjs
  - src/components/chat/chat-bottombar.tsx
  - src/components/chat/chat.tsx
  - src/components/chat/command-palette.tsx
  - src/components/chat/simple-chat-view.tsx
  - src/components/theme-toggle.tsx
  - src/lib/message-text.ts
---

## Decided
The home page is a server component, so the landing page is in the built HTML. The chat reads ?query= from the address after mounting: useSearchParams in Chat made everything below Suspense render only in the browser.
useChat lives in a small engine component that loads when the browser is idle, or at once on the first ask. Until it arrives, sends and message changes wait in a queue. That keeps the AI SDK and zod (85KB gzipped) out of first load. The conversation view, panels, palette and dialogs load the same way. First-load JS went from 391KB to 267KB gzipped.
The React Compiler is on. Lint skips .agents, .claude and .taste-skill, which are agent tooling and not app code.

## Tried and ruled out
Taking a plain constant from a file marked 'use client' into a server file: the server receives a client reference rather than the value, and Next drops it without an error. Shared constants live in plain modules.
A hand-written useCallback in a compiled component: the compiler said it could not keep the memoization and skipped the whole component.

## Watch out
Importing a helper from 'ai' at runtime, even a one-liner, pulls the SDK back into first load. Use the copies in message-text.ts and type-only imports.
In the .taste-skill tools, click.mjs fails 6 checks and chats.mjs fails 6 on main as well: the scripts predate the glide scroll and the sidebar rework. To test the skip link, focus the body first, because the composer takes focus on load.

In the code:
src/hooks/use-live-chat.tsx, src/components/chat/live-chat-engine.tsx, src/lib/message-text.ts, src/lib/theme-colors.ts, src/app/page.tsx, next.config.ts, eslint.config.mjs
