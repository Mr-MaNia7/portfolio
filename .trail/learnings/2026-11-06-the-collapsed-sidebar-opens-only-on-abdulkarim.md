---
title: "The collapsed sidebar opens only on a click, never on hover"
author: Abdulkarim
date: 2026-11-06
branch: main
id: l-54946962
scope: repo
status: active
src: agent
touches:
  - src/app/globals.css
  - src/components/chat/chat.tsx
  - src/components/chat/sidebar.tsx
---

## Decided
The collapsed sidebar is a plain icon rail like ChatGPT's: Open sidebar, New chat, Back to portfolio. The full sidebar opens only when the toggle is clicked.

## Tried and ruled out
Sliding the whole sidebar out over the chat when the pointer rested on the rail (a hover "peek"). The owner found it confusing: the overlay covered the rail's own Open sidebar button, so aiming for the toggle often clicked something in the overlay instead. Adding a "keep open" button inside the peek didn't solve it either.

## Watch out
Don't bring back hover-to-open on the rail. The floating sidebar is still used, but only as a modal opened on purpose: the drawer below 1024px and the sheet beside an open side panel.

In the code: SidebarRail and SidebarFloat in src/components/chat/sidebar.tsx; the peek state, timers and side-peek keyframes were removed from chat.tsx and globals.css.
