---
title: "Test the live chat on a stream simulated inside the page, because one Gemini rate-limit error already spends three requests"
author: Abdulkarim
date: 2026-11-05
branch: main
id: l-74d9803f
scope: repo
status: active
src: agent
touches:
  - src/app/api/chat/route.ts
  - src/app/globals.css
  - src/components/AvailabilityCard.tsx
  - src/components/artifact/artifact.tsx
  - src/components/chat/HelperBoost.tsx
  - src/components/chat/chat-bottombar.tsx
  - src/components/chat/chat-landing.tsx
  - src/components/chat/chat-message-content.tsx
  - src/components/chat/chat.tsx
  - src/components/chat/preset-reply.tsx
---

## Decided
Live chat states (thinking, tool steps, streaming, stop, every failure) are tested against a stream simulated in the page: fetch for /api/chat is replaced through CDP so a test can hold the response, push chunks one at a time, stop mid-stream or fail. CDP's own request interception can only answer a request all at once, so it cannot show streaming or a mid-stream drop. It stays on underneath as a guard so nothing reaches Gemini.
Real Gemini messages are kept for a final check only.

## Tried and ruled out
Spending real messages to see live states: the free tier ran out after two real messages, and the second message hit the limit between the tool step and the words.

## Watch out
The AI SDK retries a failed call (the log says "Failed after 3 attempts"), so one rate-limited message costs three requests, and a tool turn is two model calls before retries.
The design skill's consistency audit judges the hero h1 against --category or, without it, the page title. Its copy-headline result changes with those flags, so record the flags with every run before comparing two runs.
The project owner likes the review panel's redesign and approved the eight lead-ins. Cobalt is reserved for actions, so stars, bars and selected markers in the panels are neutral; that was the agent's reading of the rule and can be reverted in one file if the owner prefers.

In the code:
.taste-skill/chat-restyle/tools/sim.mjs (SIM_SOURCE), robust.mjs, live.mjs; src/app/api/chat/route.ts (streamText); .claude/skills/design-taste-frontend/scripts/consistency.mjs flags --category --primary
