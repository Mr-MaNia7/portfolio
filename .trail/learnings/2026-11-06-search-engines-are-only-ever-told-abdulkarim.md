---
title: "Search engines are only ever told the www address, every page sets its own canonical, and case studies are real pages the landing cards link to"
author: Abdulkarim
date: 2026-11-06
branch: main
id: l-10bffeef
scope: repo
status: active
src: agent
touches:
  - README.md
  - docs/SEO_AUDIT.md
  - next.config.ts
  - portfolio-config.json
  - src/app/globals.css
  - src/app/layout.tsx
  - src/app/opengraph-image.tsx
  - src/app/page.tsx
  - src/app/resume.pdf/route.ts
  - src/app/robots.ts
---

## Decided
The site serves from www and the bare domain only 308-redirects there, so the site URL module defaults to www and upgrades the bare domain even if NEXT_PUBLIC_SITE_URL is set to it. Vercel's env value is unknown and the local Vercel CLI is logged into a different account, so the code had to be right on its own.
Canonical URLs and Open Graph are set per page, never in the root layout: a canonical in the layout is inherited by every page and points them all at home. Next merges metadata shallowly, so a page's openGraph replaces the layout's whole object; build it with pageOpenGraph().
Each project has a static page at /work/<slug> (slug in the config). The landing page's case-study cards and buttons are real links to those pages; a plain click is intercepted to open the existing dialog, while modified clicks and crawlers get the page.
JSON-LD is one graph with stable @ids (#person, #website). The Person lists every name variant the owner uses (full name Abdulkarim Getachew Mohammed) as alternateName; the display name stays "Abdulkarim G. Mohammed". The placeholder headshot is left out of the schema until a real photo exists.

## Tried and ruled out
Short preset answers inside the question cards: they pushed the section past one screen at every desktop size and had to be clamped mid-sentence. The About section and case-study pages carry the server-rendered facts instead.
Longer keyword headings ("AIVI case study: from a 45-day trial to the whole voice AI platform"): they wrapped to two lines and broke the one-screen rhythm. Headings stay about the length they were.
The thesis DOI in the Person's sameAs: sameAs is for profiles of the same person; the thesis is a ScholarlyArticle on its own page.
A full Content-Security-Policy: Next's inline scripts and Vercel Analytics need nonces; only frame-ancestors is set.

## Watch out
Measure every landing section's height against the live site before shipping copy changes; the rhythm holds one screen from 1024x768 to 1920x1080, and the phone hero must stay 812px at 375x812 so the composer is on the first screen.
A component-layer CSS rule on an element that also has a Tailwind display or font-size utility does nothing; use a Tailwind variant such as lg:[@media(max-height:800px)]:text-[16px] on the element.

In the code:
src/lib/site.ts (SITE_URL, pageOpenGraph, workPath, snippet), src/lib/structured-data.ts, src/components/json-ld.tsx, src/app/work/page.tsx, src/app/work/[slug]/page.tsx, src/components/site-chrome.tsx, src/app/llms.txt/route.ts, src/app/robots.ts, src/app/sitemap.ts, src/components/chat/chat-landing.tsx (openCaseStudy, About section), portfolio-config.json (slug, fullName, alternateNames), docs/SEO_AUDIT.md
