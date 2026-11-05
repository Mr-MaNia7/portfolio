---
title: "Beside the side panel the sidebar always steps aside to a rail, and focus returns only after the chat stops being inert"
author: Abdulkarim
date: 2026-11-05
branch: main
id: l-a6719e86
scope: repo
status: active
src: agent
touches:
  - src/app/globals.css
  - src/components/artifact/artifact.tsx
  - src/components/chat/HelperBoost.tsx
  - src/components/chat/chat-landing.tsx
  - src/components/chat/chat-message-content.tsx
  - src/components/chat/chat.tsx
  - src/components/chat/preset-reply.tsx
  - src/components/chat/simple-chat-view.tsx
  - src/components/chat/tool-renderer.tsx
  - src/components/chat/top-bar.tsx
---

## Decided
The side panel takes its width from what the frame leaves after a collapsed rail and a 560px reading column, so opening it rails the sidebar at every width. Keeping the sidebar docked on very wide screens looked affordable but squeezed the column to 533px at 2560, and the extra case gained nothing.
Live answers render the tool card above the text, in arrival order. Lead-in above card is only for instant answers, where both appear at once. Text above a card would push the card down while the words stream in.

## Tried and ruled out
Handing focus back to the opener directly in the close handler: below 1280 the panel is modal and the chat behind it is inert, so the focus call silently does nothing and focus is lost. It has to run after the render that clears inert.

## Watch out
Scripted clicks show focus rings on the panel's close button that a real pointer does not, so use real mouse events for screenshots of the open panel.
The landing page's `.twin-exchange` link only exists from 1280 up, and nav words and hero actions are hidden on phones. Click-through steps for those are gated by width, so a skipped step there is not a lost check.

In the code:
src/components/chat/chat.tsx (sidebarRailed, closePanel, captureFlip), src/app/globals.css (.side-panel width), src/components/chat/simple-chat-view.tsx, .taste-skill/chat-restyle/tools/click.mjs
