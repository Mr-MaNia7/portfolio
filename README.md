# Abdulkarim G. Mohammed — Portfolio

A conversational, AI-powered portfolio for **Abdulkarim G. Mohammed**, Senior Full-Stack Engineer & AI/LLM Specialist. Instead of a static résumé, the site *is* a chat: ask it anything and it answers with rich, structured cards — projects, skills, experience, availability, contact.

Built on the **Claude research-journal design system** — warm ivory parchment, near-black slate ink, a single clay accent, an editorial serif for display, and JetBrains Mono for chrome. Flat, hard-edged, zero shadows.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-149eca?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript" alt="TypeScript 5.9">
  <img src="https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss" alt="Tailwind CSS v4">
  <img src="https://img.shields.io/badge/AI%20SDK-Google%20Gemini-c15f3c" alt="Vercel AI SDK · Gemini">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License">
</p>

<p align="center">
  <a href="https://abdulkarim.dev"><b>Live site →</b></a>
</p>

> **About the developer** — Top Rated Plus on Upwork · 100% Job Success · $60K+ earned across 26 jobs and 4,289 tracked hours. Senior full-stack engineer from Addis Ababa building where web engineering meets applied AI.

---

## Signature features

- **Conversational UI** — a ChatGPT-style interface where the "digital twin" answers as Abdulkarim, calling tools that render bespoke cards.
- **⌘K command palette** — Raycast-style menu to jump anywhere: ask a question, open a profile, copy the email, toggle the theme.
- **Slash commands** — type `/` in the composer for `/projects`, `/skills`, `/resume`, `/hire`, `/contact`, `/upwork`, and more.
- **Instant preset answers** — the core questions render immediately from curated content, with **no API call**, so the site never looks broken at rate limits. An "Ask the live AI" button escalates to the model for free-form depth.
- **Light / dark** — the ivory ↔ slate rhythm tuned for both themes (not a naive inversion).
- **Dynamic OG image** — generated at `/opengraph-image` in the same design system.
- Fully **responsive**, keyboard-first, and accessible (visible focus, ARIA labels, reduced-motion support).

---

## Tech stack

| Layer | Choices |
|---|---|
| **Framework** | Next.js 16 (App Router, RSC, Turbopack) · React 19 · TypeScript 5.9 (strict) |
| **Styling** | Tailwind CSS v4 · design tokens in `globals.css` · Framer Motion |
| **AI** | Vercel AI SDK (`ai`, `@ai-sdk/google`, `@ai-sdk/react`) → Google Gemini |
| **UI** | Radix primitives · lucide-react · sonner · vaul |
| **Type** | Newsreader (serif display) · Inter (UI) · JetBrains Mono (chrome) |
| **Tooling** | pnpm · ESLint · Prettier |

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

Get a key at [Google AI Studio](https://aistudio.google.com/apikey). The preset answers work **without** a key; only free-form questions need it.

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

Colors, fonts, and the signature CTA shape are defined in [`src/app/globals.css`](src/app/globals.css) (`:root` and `.dark`). The palette / slash-command set is in [`src/lib/commands.ts`](src/lib/commands.ts).

---

## Architecture

```
portfolio-config.json        # single source of truth
src/
├─ app/
│  ├─ layout.tsx             # fonts, metadata, JSON-LD
│  ├─ page.tsx               # renders <Chat/>
│  ├─ opengraph-image.tsx    # dynamic social card
│  └─ api/chat/              # Vercel AI SDK route + tools
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

The AI's tools — `getPresentation`, `getProjects`, `getSkills`, `getResume`, `getContact`, and the availability tool — each read from the config and render a matching card component. The system prompt is assembled from the same config, so updating `portfolio-config.json` updates what the digital twin knows.

---

## Deploy

Optimized for **Vercel**:

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).
2. Set `GOOGLE_GENERATIVE_AI_API_KEY` and `NEXT_PUBLIC_SITE_URL` in the project's Environment Variables.
3. Deploy. Framework (Next.js) and package manager (pnpm) are auto-detected.

---

## Credits & acknowledgements

This project began as a fork of the open-source [**AI-Powered Portfolio**](https://github.com/anujjainbatu/portfolio) template created by **Anuj Jain** ([@anujjainbatu](https://github.com/anujjainbatu)) — full credit to them for the original conversational-portfolio concept and scaffold, released under the MIT License.

From that starting point, this version rebuilds all of the content and completely redesigns the UI/UX to the Claude research-journal design system, and upgrades the stack (Next.js 16, AI SDK v7, and more). The original license and attribution are preserved in [`docs/LICENSE`](docs/LICENSE).

Thank you, [@anujjainbatu](https://github.com/anujjainbatu). 🙏
