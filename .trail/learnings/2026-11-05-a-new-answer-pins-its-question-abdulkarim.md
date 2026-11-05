---
title: "A new answer pins its question to the top of the transcript instead of scrolling to the bottom, and desktop sections take their rhythm from screen height"
author: Abdulkarim
date: 2026-11-05
branch: main
id: l-2b43bd2b
scope: repo
status: active
src: agent
touches:
  - src/app/globals.css
  - src/components/AvailabilityCard.tsx
  - src/components/artifact/artifact.tsx
  - src/components/artifact/copy-email.tsx
  - src/components/chat/HelperBoost.tsx
  - src/components/chat/chat-bottombar.tsx
  - src/components/chat/chat-landing.tsx
  - src/components/chat/chat-message-content.tsx
  - src/components/chat/chat.tsx
  - src/components/chat/command-palette.tsx
---

## Decided
Answers are taller than the screen, so scrolling to the end of a new answer opened it mid-way with its question out of view. A new turn now pins the question to the top, and a spacer below the thread gives a short answer room to pin. Live streaming no longer auto-follows: the reader reads downward from the question.
Desktop width is fixed by the frame, so section rhythm comes from screen height: top padding grows on tall screens and tightens below 800px, so a section holds one screen from 1024x768 up to 1920x1080.
The hero's chat window shows more of the real conversation on tall screens, using only strings already in the config, so its empty middle is filled without new copy.
Phone section heights stay natural; the skill's phone screen-height findings are reported, not forced.

## Tried and ruled out
Overriding spacing for short screens with component classes while Tailwind utilities remained on the element: utilities win over the components layer, so the overrides silently did nothing. Move the value into the class, as .question-card and .row-list do.
Shrinking the services rows and question cards to fix 1280x720 overruns did nothing, because the right-hand card column and the 17svh row maximum set those heights. Measure what actually sets the height first.

## Watch out
When testing, intercept /api/chat so the Gemini free tier is not spent: fulfil it with 429 for the paused state, or hold it for the thinking state.
Blind find-and-replace restyles can leave undefined classes that compile silently, such as btn--primary.5 and btn-brand, which render as plain text. grep for them after any bulk edit.

In the code:
src/components/chat/chat.tsx (lastTurnKey, syncSpacer, PIN_GAP, data-turn-start), src/app/globals.css (--padt, .section__body, .flagship, .btn--sm, .text-btn, .stat-strip)
