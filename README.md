# Abdulkarim G. Mohammed — Portfolio

A conversational, AI-powered portfolio for **Abdulkarim G. Mohammed**, Senior Full-Stack Engineer & AI/LLM Specialist. Instead of a static résumé, the site is a chat: ask it anything and it answers with rich, structured cards — projects, skills, experience, availability, contact.

Built on the **Claude research-journal design system** — warm ivory parchment, near-black slate ink, a single clay accent, an editorial serif for display, and JetBrains Mono for chrome. Flat, hard-edged, zero shadows.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black" alt="Next.js 15">
  <img src="https://img.shields.io/badge/React-19-blue" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-strict-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License">
</p>

---

## Signature features

- **Conversational UI** — a ChatGPT-style interface where the "digital twin" answers as Abdulkarim, calling tools that render bespoke cards.
- **⌘K command palette** — Raycast-style menu to jump anywhere: ask a question, open a profile, copy the email, toggle the theme.
- **Slash commands** — type `/` in the composer for `/projects`, `/skills`, `/resume`, `/hire`, `/contact`, and more.
- **Instant preset answers** — the six core questions render immediately from curated content, with **no API call**, so the site never looks broken at rate limits. A "Ask the live AI" button escalates to the model for free-form depth.
- **Light / dark** — the ivory ↔ slate rhythm in both themes.
- **Dynamic OG image** — generated at `/opengraph-image` in the same design system.
- Fully **responsive**, keyboard-first, and accessible (visible focus, ARIA labels, reduced-motion support).

---

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Vercel AI SDK (Google Gemini) · Newsreader / Inter / JetBrains Mono.

---

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then add your key (see below)
pnpm dev                      # http://localhost:3000
```

### Environment

```bash
GOOGLE_GENERATIVE_AI_API_KEY=...     # Google AI Studio key for the live chat
NEXT_PUBLIC_SITE_URL=https://...     # your domain (used for SEO/OG/sitemap)
```

Get a key at [Google AI Studio](https://aistudio.google.com/). The preset answers work **without** a key; only free-form questions need it.

---

## Editing the content

**Everything** lives in one file: [`portfolio-config.json`](portfolio-config.json). Change it and the whole site — copy, cards, AI system prompt, SEO — updates. Sections: `personal`, `stats`, `availability`, `experience`, `education`, `skills`, `projects`, `social`, `resume`, `chatbot`, `presetQuestions`.

### Things to personalize

| What | Where | Notes |
|---|---|---|
| **Profile photo** | `personal.avatar` | Currently a generated `AG` monogram (`/public/avatar.svg`). Drop a headshot in `/public` and point `avatar` at it (e.g. `/profile.jpg`). |
| **Résumé PDF** | `resume.downloadUrl` | Add `public/resume.pdf` (the default path) or link an external URL. |
| **Social links** | `social.github` / `linkedin` / `twitter` | Confirm these — the GitHub/LinkedIn/X handles are best-guess placeholders. Upwork is set. |
| **Contact email** | `personal.email` | Currently `files@aivi.io`. |
| **Project covers** | `projects[].cover` | Branded SVGs live in `/public/covers`. Swap for real screenshots via `projects[].images`. |

### Design tokens

Colors, fonts, and the signature CTA shape are defined in [`src/app/globals.css`](src/app/globals.css) (`:root` and `.dark`). Commands for the palette/slash menu are in [`src/lib/commands.ts`](src/lib/commands.ts).

---

## Architecture

```
portfolio-config.json        # single source of truth
src/
├─ app/
│  ├─ layout.tsx             # fonts, metadata, JSON-LD
│  ├─ page.tsx               # renders <Chat/>
│  ├─ opengraph-image.tsx    # dynamic social card
│  └─ api/chat/              # Vercel AI SDK route + 6 tools
├─ components/
│  ├─ chat/                  # shell, top bar, composer, command palette, landing
│  ├─ presentation · skills · contact · resume · AvailabilityCard · projects/
│  └─ ui/                    # primitives (button, badge, chat bubble…)
├─ lib/
│  ├─ config-loader.ts       # loads config, exposes parsed data
│  ├─ config-parser.ts       # builds the AI system prompt + view models
│  └─ commands.ts            # ⌘K / slash command set
└─ types/portfolio.ts        # config schema
```

The AI's tools (`getProjects`, `getPresentation`, `getSkills`, `getResume`, `getContact`, `getInternship`) each return data from the config and render a matching card component.

---

## Deploy

Optimized for **Vercel**: push to GitHub, import, set `GOOGLE_GENERATIVE_AI_API_KEY` and `NEXT_PUBLIC_SITE_URL`, deploy.

---

## Credits

The conversational-portfolio concept and initial scaffold come from the open-source [AI-Powered Portfolio](https://github.com/anujjainbatu/portfolio) template by **Anuj Jain** (MIT). This project rebuilds the content and redesigns the entire UI to the Claude design system. See [`docs/LICENSE`](docs/LICENSE).
