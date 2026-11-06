---
title: "The landing page is prerendered only while nothing in the chat reads the URL during render, and server files take constants from plain modules, not client files"
author: Abdulkarim
date: 2026-11-06
branch: main
id: l-dc9d34c2
scope: repo
status: active
src: agent
touches:
  - next.config.ts
  - package.json
  - pnpm-lock.yaml
  - src/app/api/chat/prompt.ts
  - src/app/api/chat/route.ts
  - src/app/globals.css
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/components/chat/answer-cards.tsx
  - src/components/chat/chat-landing.tsx
---

## Decided
The home page is a server component and the whole landing page is in the prerendered HTML. The chat reads ?query= from window.location after mounting instead of useSearchParams: useSearchParams anywhere in Chat turned everything below the nearest Suspense into client-only rendering, so the built HTML had only the title and a BAILOUT_TO_CLIENT_SIDE_RENDERING marker.
The conversation view (turns, preset replies, markdown), the panel details, the command palette, the hire sheet and the case-study dialog load with next/dynamic and are fetched when the browser goes idle. The system prompt is built in a server-only module, so it no longer ships to the browser. The React Compiler is on.

## Tried and ruled out
Exporting THEME_COLORS from the 'use client' ThemeColor file and importing it into the server layout: the layout receives a client reference, not the string, and Next silently dropped the theme-color meta tag. Shared constants go in a plain module.
A useCallback in ChatLanding: the React Compiler reported it could not preserve the manual memoization and skipped the whole component. Leave memoization to the compiler in compiled components.

## Watch out
The one BAILOUT marker left in index.html comes from Vercel Analytics, which reads search params inside its own Suspense. It renders nothing, so it is harmless.
In .taste-skill/chat-restyle/tools/click.mjs, the five nav anchor checks and the "Collapse sidebar" step fail on main too: the 350ms wait ends mid-glide, and the control is now named Close sidebar. Wait about 1.6s before measuring where an anchor lands.
The composer takes focus on load, so blur() does not reset where Tab starts. To test the skip link, focus the body first.
The ai package brings zod (about 85KB gzipped) into first load through useChat. That is the largest remaining first-load cost.

In the code:
src/app/page.tsx; src/components/chat/chat.tsx (chatTransport, preloadLater, ?query effect, offerUndo, historyRef); src/lib/system-prompt.ts; src/lib/theme-colors.ts; src/components/theme-color.tsx; next.config.ts (reactCompiler)
