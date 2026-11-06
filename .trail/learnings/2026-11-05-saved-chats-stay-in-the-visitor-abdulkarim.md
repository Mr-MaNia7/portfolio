---
title: "Saved chats stay in the visitor's browser, and the sidebar lists whole chats rather than this chat's questions"
author: Abdulkarim
date: 2026-11-05
branch: main
id: l-f76823c0
scope: repo
status: active
src: agent
touches:
  - src/app/globals.css
  - src/components/chat/chat-bottombar.tsx
  - src/components/chat/chat.tsx
  - src/components/chat/command-palette.tsx
  - src/components/chat/sidebar.tsx
  - src/components/chat/top-bar.tsx
  - src/lib/commands.ts
---

## Decided
The owner chose to keep saved chats only in the visitor's browser: no accounts, no backend, nothing to disclose to hiring managers. Reading what visitors ask from a server was offered and declined.
The sidebar lists whole chats, titled by their first question, plus Ask next. Back to portfolio is the sidebar's first row and keeps the chat saved. Collapsed, the sidebar is an icon rail that peeks the full sidebar over the chat on hover. The ⌘K palette has a "Your chats" group, so saved chats are reachable from the landing page without changing its sections.

## Watch out
Opening a chat must not count as a change, or it jumps to the top of the list: the last saved content is compared before writing.
Leaving a chat mid-answer stops the answer and saves what arrived, marked Stopped.
After Esc closes the peek, the pointer must leave the rail and come back to open it again.

In the code:
src/lib/chat-store.ts (chatStore, 30 chats, key twin-chats-v1), src/components/chat/chat.tsx (activeChatId, openChat, deleteChat, peekOpen), src/components/chat/sidebar.tsx, .taste-skill/chat-restyle/tools/chats.mjs
