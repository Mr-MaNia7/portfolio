---
title: "The hero leads with 99.9% uptime, and the 5,000+ hours stat is labelled as Upwork's own count with the Upwork logo"
author: Abdulkarim
date: 2026-11-15
branch: main
id: l-e5864517
scope: repo
status: active
src: agent
touches:
  - portfolio-config.json
  - src/app/api/chat/tools/getProjects.ts
  - "src/app/work/[slug]/page.tsx"
  - src/app/work/page.tsx
  - src/components/chat/chat-landing.tsx
  - src/components/chat/hire-sheet.tsx
  - src/components/projects/AllProjects.tsx
  - src/components/projects/project-dialog.tsx
  - src/components/site-chrome.tsx
  - src/lib/config-parser.ts
---

## Decided
The first hero stat is "99.9%" with the label "Uptime on services I build", a figure the owner supplied. It replaced "500+ PRs merged", which now lives in the AIVI case study. The owner chose present tense and no client name in the label; AIVI-specific copy (case study result, the twin's sample answer) keeps "the services I built run at 99.9% uptime".
The owner confirmed Upwork itself shows 5,000+ hours, so that stat reads "Hours delivered on Upwork" with the Upwork logo before the label. A stat can carry an optional icon in the config for this.

## Tried and ruled out
Leaving 5,000+ unbranded, or swapping in a different Upwork hour count: both offered, and the owner confirmed the 5,000+ figure is Upwork's.
"Uptime on AIVI services I built" and "Uptime on services I built": the owner asked for the general, present-tense wording.

## Watch out
Buyers can open the public Upwork profile, so any stat shown with the Upwork logo must match what Upwork displays.
The Upwork mark is the Simple Icons path, filled with Upwork green; only the landing page stat list renders the icon (résumé PDF, social image and llms.txt show the text only).

In the code:
portfolio-config.json (stats[].icon, AIVI metrics order: uptime first), public/icons/upwork.svg, src/types/portfolio.ts (Stat.icon), src/components/chat/chat-landing.tsx (statList)
