---
title: "Open and collapsed sidebar share the same rows, so no control moves when it toggles"
author: Abdulkarim
date: 2026-11-06
branch: main
id: l-27740d01
scope: repo
status: active
src: agent
touches:
  - src/app/globals.css
  - src/components/chat/chat.tsx
  - src/components/chat/sidebar.tsx
---

## Decided
The owner wants each sidebar control in one place whether the sidebar is open or collapsed. Both states use the same rows: the toggle on row 1 (top-left in both, so open and close are one spot), then Back to portfolio, New chat, Search. Open, the saved chats list follows; collapsed, a Recents icon opens them in a small card on click (never on hover). Search opens the existing command palette.

## Tried and ruled out
Back to portfolio on top with the toggle beside New chat when open, but the toggle first and Back last when collapsed: the owner disliked controls changing position between the two states.

## Watch out
Rows line up only because both states use 40px rows with a 2px gap and the same 16px top padding, and the 42px rail buttons sit on the same left line as the row icons. Change a row height, gap or padding in one state and you must change the other.

In the code: SidebarContent, SidebarRail, RecentsMenu in src/components/chat/sidebar.tsx; .side--rail, .side__head, .side__rail-btn, .recents in src/app/globals.css.
