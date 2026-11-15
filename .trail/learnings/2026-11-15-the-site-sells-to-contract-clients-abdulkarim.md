---
title: "The site sells to contract clients: the hero leads with the outcome, and every case study reads challenge, what I built, result"
author: Abdulkarim
date: 2026-11-15
branch: main
id: l-f81b3770
scope: repo
status: active
src: agent
touches:
  - portfolio-config.json
  - "src/app/work/[slug]/page.tsx"
  - src/app/work/page.tsx
  - src/components/chat/chat-landing.tsx
  - src/components/chat/hire-sheet.tsx
  - src/components/projects/AllProjects.tsx
  - src/components/projects/project-dialog.tsx
  - src/components/site-chrome.tsx
  - src/lib/project-cover.ts
  - src/lib/system-prompt.ts
---

## Decided
The owner chose contract clients (CEOs, CTOs, hiring managers buying senior contract work) as the main audience. The hero now opens with the outcome ("I take AI products from demo to production.", from personal.headline) and the AI twin is how a visitor checks that claim, not the headline. Landing buttons say "Start a project"; the top bar keeps the shorter "Hire me".
The hero's first stat is "500+ PRs merged on AIVI's platform". "$60K+ earned on Upwork" was taken out of the stats at the owner's request because it anchors a senior rate low; it stays in the bio.
The offer is a call, then a written plan: send a few lines, a 30-minute call, a written plan and estimate within 48 hours. The owner turned down offering a paid trial. These steps live once in the config and feed the landing close, the hire sheet, the case-study footer and the twin's prompt.
Case studies show a one-line summary, then The challenge, What I built (highlights) and The result. The description stays in the config for meta descriptions, llms.txt, structured data and the twin, but is no longer shown when a challenge exists. Challenge and outcome text uses only facts the owner has confirmed; AIVI, Svetness, Aladia and FINN still have no business outcome numbers.
Services are written as the buyer's problem with my offer underneath, in their own config list, separate from availability.focusAreas, which the résumé, llms.txt and prompt still use.

## Tried and ruled out
A longer hero lead with the twin invitation and the AIVI sentence on every size: the phone hero grew to 880px and pushed the composer off the first screen, and 1024x768 went to 872px. The twin sentence is gone (the chat window says it), and the AIVI sentence shows from xl up only.
A "full project notes" fold repeating the description on case-study pages: it repeated the challenge, list and result.

## Watch out
Hero copy is at its height limit: 812px at 375x812 and 768px at 1024x768. Re-measure after any wording change.
Each service row has a second line (the offer) that is hidden on desktop screens 800px tall or shorter, or the section passes one screen.
trail check flags the AIVI outcome's "security and SOC 2" as the ruled-out full CSP; that is copy, not a header.

In the code:
portfolio-config.json (personal.headline, stats, services, engagement, projects[].summary/challenge/outcome, project order), src/types/portfolio.ts (Service, Engagement), src/components/chat/chat-landing.tsx (hero, services, closing steps), src/app/work/[slug]/page.tsx, src/components/projects/project-dialog.tsx, src/lib/project-cover.ts (projectSummary), src/components/chat/hire-sheet.tsx, src/components/site-chrome.tsx, src/lib/system-prompt.ts
