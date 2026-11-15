---
title: "The About heading says About me, and the full legal name lives in the bio's first sentence instead"
author: Abdulkarim
date: 2026-11-15
branch: main
id: l-6638b2af
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
The owner asked for "About me" as the About heading instead of "About Abdulkarim Getachew Mohammed". The heading was the only visible place for the full legal name, which people search for, so the bio now opens with "I'm Abdulkarim Getachew Mohammed, …". The twin and profile card read the same bio.
In the same pass the owner rejected the availability line stacked above the name line in the hero: two small gray lines competing. Availability now sits under the hero buttons as one line ("Available now for contract work · replies in 0–4 hours"), and the config headline says "contract work", not "freelance contracts".
The company in the About card's "Now" row links to its site.

## Watch out
Don't put the full name back in the About heading or another eyebrow line above the hero name; keep the full name in visible text somewhere (the bio) so search can read it.

In the code:
src/components/chat/chat-landing.tsx (About heading, Now row link, availability line under hero actions), portfolio-config.json (personal.bio, availability.headline)
