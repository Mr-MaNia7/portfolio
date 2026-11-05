---
title: "The chat stays the primary surface even where the design skill's page rules say otherwise"
author: Abdulkarim
date: 2026-11-05
branch: main
id: l-d75bf056
scope: repo
status: active
src: agent
touches:
  - public/avatar.svg
  - public/manifest.json
  - src/app/globals.css
  - src/app/icon.svg
  - src/app/layout.tsx
  - src/app/opengraph-image.tsx
  - src/components/AvailabilityCard.tsx
  - src/components/artifact/artifact.tsx
  - src/components/artifact/copy-email.tsx
  - src/components/chat/HelperBoost.tsx
---

## Decided
The first screen is the real working AI twin chat, not a mock, and a fixed composer dock takes over once the hero scrolls off. The design skill forbids chat widgets and extra fixed elements, but the owner named the twin chat as the one thing that must stay, so that wins.
The content frame is wider than the skill's 1280px cap because the owner's complaint was unused side space on desktop.
The skill dealt a sand ground for the hero frame; a cool sky ground is used instead, since warm parchment was the "looks like Claude" complaint.
Phone sections are left at their natural height instead of padded to exact one or two screens, which would add empty scrolling.

## Tried and ruled out
Symlinking node_modules into a git worktree to run an old commit: Turbopack rejects it ("points out of the filesystem root"). Clone it with `cp -cR` instead.

## Watch out
The skill's consistency audit takes over 400s on the multi-section landing page, so run it in the background. Do not edit source while it runs: hot reload changes the page mid-audit.
Do not re-add terminal vocabulary (mono uppercase labels, `//` kickers, fake filenames like projects.json, a `›` prompt). That vocabulary was most of what made the site read as Claude Code.

In the code:
src/components/chat/chat.tsx (landing vs conversation shell, dock), src/components/chat/chat-landing.tsx, src/app/globals.css (--wrap, --lit tokens)
