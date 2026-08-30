# Portfolio Rebuild & Polish — Progress Report

**Project:** Rebuild the cloned AI-chat portfolio into Abdulkarim G. Mohammed's own, and polish the entire UI/UX to the Claude design system.
**Branch:** `agents/portfolio-rebuild-and-polish` (git worktree)
**Date:** 2026-08-30
**Status:** ✅ Core rebuild complete — production build passing. Awaiting a few real assets/links from you (see [§7](#7-outstanding--what-i-need-from-you)).

---

## 1. Objective

Three asks from the brief:

1. **Rebuild the content** so the portfolio reflects Abdulkarim's real experience — and add the skills a senior tech lead with 5+ years should have.
2. **Answer whether Upwork content is scrapeable.**
3. **Polish the entire UI/UX** to match the Claude Code application experience (per `.claude/skills/design-system/SKILL.md`), while keeping the ChatGPT-like conversational format.

Bar set by the brief: "the best portfolio in the world with award-winning features."

---

## 2. Scraping investigation

| Source | Result | Detail |
|---|---|---|
| `upwork.com/freelancers/abdulkarimg` | ❌ Blocked | Returns `403 Forbidden` to automated requests. |
| `upworkmrr.com/freelancer/…` | ⚠️ Partial | JavaScript-rendered; only surfaced "Abdulkarim G. — Top 3% in Ethiopia". |
| **`himalayas.app/@abdulkarimgmohammed`** | ✅ **Usable** | A full public mirror of the Upwork profile — the primary source used. |
| Web search | ✅ Supplementary | Confirmed the Upwork handle (`~01dc65c291b2936bc3`) and headline. |

**Conclusion:** Upwork itself cannot be scraped, but your himalayas.app profile carries the same content and was scrapeable. All content below is sourced from it plus public search — **nothing fabricated** (no invented certifications, clients, testimonials, or metrics).

---

## 3. Decisions locked (from your answers)

| Question | Your choice |
|---|---|
| Positioning | **Senior Full-Stack Engineer & AI/LLM Specialist** |
| Profile image | **You'll provide a photo** → shipped a clean `AG` monogram placeholder that swaps out automatically |
| Availability | **Freelance & contract work** |
| AI chat | **Keep live AI + bulletproof preset answers** (never looks broken at rate limits) |

---

## 4. What was built — Content

`portfolio-config.json` is now entirely yours (single source of truth for the whole site):

- **Identity & positioning** — senior full-stack + AI/LLM, Addis Ababa, Top Rated (top 3% in Ethiopia).
- **Experience** — real history: Upwork (Top Rated), Turing (LLM training / RLHF), EWA Services (FINN banking backend), Canal+ (ATCOM AI call-management, ~35% quality gain), Hiya (rental automation, ~75% productivity).
- **Education & research** — Addis Ababa University, BSc SWE (AI stream), 3.8 GPA; published Afan Oromo hate-speech NLP research (90%+ accuracy).
- **Skills** — the full senior stack, with **senior tech-lead additions** you asked for: system design & architecture, technical leadership & mentoring, code review, testing (unit/integration/E2E), API design, performance, security. Organized into Languages, Frontend, Backend, AI & LLM, Data & ML, Cloud & DevOps, Databases, Engineering practices.
- **Projects** — 6 case studies with role, client, description, metrics, highlights, and stack.
- **Availability** — reframed from the template's "seeking internship" to freelance/contract, with focus areas and working style.
- **AI persona** — the digital twin now speaks as you to a *client/recruiter* (not "interview candidate"), with a guardrail against inventing facts.

---

## 5. What was built — Design system (Claude aesthetic)

Every component rebuilt from the template's iMessage-blue/rounded/gradient look to the Claude research-journal aesthetic:

- **Palette** — warm ivory parchment (`#faf9f6`) ground, near-black slate ink (`#141413`), a single earthy clay accent (`#c15f3c`), warm hairline borders. Alternating ivory ↔ slate rhythm (e.g., the contact card's slate header).
- **Typography** — **Newsreader** editorial serif for display, **Inter** for UI, **JetBrains Mono** for chrome/labels.
- **Form** — flat, hard-edged, zero shadows; the signature flat-top/rounded-bottom primary CTA; emphasis from type and underlines, not color/glow.
- **Themes** — full light **and** dark, both tuned (not naive inversion).
- **Tokens** — centralized in `src/app/globals.css` (`:root` + `.dark`).

---

## 6. What was built — Signature features

The "Claude Code" DNA, beyond a static résumé:

- **⌘K command palette** — Raycast-style: ask a question, open a profile, copy email, toggle theme; grouped Ask / Elsewhere / Actions with keyboard nav.
- **Slash commands** — type `/` in the composer for `/projects`, `/skills`, `/resume`, `/hire`, `/contact`, `/upwork`, `/theme`, etc.
- **Instant preset answers** — the six core questions render rich cards with **zero API calls**, so the site is fast and never looks broken at quota; an "Ask the live AI" button escalates for free-form depth.
- **Branded assets** — generated `AG` monogram avatar, per-project SVG covers, a dynamic OG social image (`/opengraph-image`), and an `AG` favicon.
- **Craft** — responsive to mobile, keyboard-first, visible focus states, ARIA labels, `prefers-reduced-motion` support, tuned motion.

---

## 7. Outstanding — what I need from you

Placeholders are in place and clearly flagged in `portfolio-config.json` and the README:

1. **Profile photo** — currently the `AG` monogram. Drop a headshot in `/public` and point `personal.avatar` at it.
2. **GitHub / LinkedIn / X URLs** — best-guess handles in `social` (`github.com/abdulkarimg`, etc.). Confirm or correct. *(Upwork is correct; email is `files@aivi.io`.)*
3. **Résumé PDF** — add `public/resume.pdf` (the timeline card is already rich without it).
4. **Domain** — set `NEXT_PUBLIC_SITE_URL` (defaulted to `https://abdulkarim.dev`).
5. **Gemini API key** — in `.env.local` for live free-form chat (presets work without it).

---

## 8. Verification

- ✅ `pnpm build` passes clean (routes: `/`, `/api/chat`, `/opengraph-image`, `/icon.svg`, `/robots.txt`, `/sitemap.xml`).
- ✅ Driven headless (Chrome via Playwright) across states: landing (light/dark), command palette, slash menu, project cards + detail modal, skills, contact, résumé timeline, availability, mobile.
- ✅ No console errors (fixed a theme-toggle hydration mismatch and a serif-font resolution bug found during review).

---

## 9. Key files

| Area | Files |
|---|---|
| Content | `portfolio-config.json`, `src/types/portfolio.ts` |
| Config → views/AI | `src/lib/config-loader.ts`, `src/lib/config-parser.ts`, `src/lib/commands.ts` |
| Design tokens | `src/app/globals.css`, `src/app/layout.tsx` |
| Chat shell | `src/components/chat/` (chat, top-bar, command-palette, chat-bottombar, chat-landing, HelperBoost, preset-reply) |
| Cards | `presentation`, `skills`, `contact`, `resume`, `AvailabilityCard`, `projects/` |
| AI tools | `src/app/api/chat/tools/*` |
| Assets | `public/avatar.svg`, `public/covers/*`, `src/app/icon.svg`, `src/app/opengraph-image.tsx` |

---

## 10. Suggested next steps

- [ ] Send the real GitHub / LinkedIn / X links + a headshot → I'll wire them in.
- [ ] Commit this work on the branch.
- [ ] Deploy to Vercel (set the two env vars).
- [ ] Optionally: generate a starter résumé PDF from the experience data.
