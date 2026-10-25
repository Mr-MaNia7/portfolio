# Career Data Plan — a portfolio that stays true on its own

**Status:** Proposed · **Owner:** Abdulkarim G. Mohammed · **Drafted:** 2026-10-25

## Goal

The portfolio should reflect where my career actually is — new roles, wins, things I've learned, Upwork standing, GitHub activity, and life outside code — without me remembering to hand-edit a JSON file. Freshness should be the default, and accuracy non-negotiable: nothing reaches the live site without my review.

## Principles

1. **Log a career, don't edit a profile.** Facts are dated entries appended over time. Everything the site shows — timeline, stats, skills, the AI twin's knowledge — is *derived* from those entries.
2. **Automate collection, not truth.** Machines gather and draft; I approve. Every automated change arrives as a pull request.
3. **Capture must take seconds.** If logging a win takes longer than sending a short email, it won't happen.
4. **Public by choice.** Every entry carries a visibility flag, and private data never lives anywhere the public can read.

---

## 1. Data model

### Three layers

| Layer | Holds | Updated by |
|---|---|---|
| **Profile** | Name, bio, positioning, contact, socials | Me, rarely |
| **Career log** | Dated entries — roles, wins, learnings, certifications, projects, recognition, hobbies | Captured as it happens (§3), reviewed via PR |
| **Sources** | Machine-fetched snapshots — GitHub, Upwork, chess.com, football | Scheduled sync (§2); never hand-edited |

A **derive step** combines them at build time into what the UI needs: current role, experience timeline, stats, skill recency, "last updated", hobby cards.

### Log entry shape

```ts
type LogEntry = {
  id: string;              // "2026-10-25-tech-lead-x"
  date: string;            // ISO date the thing happened
  type:
    | 'role'               // new position, promotion, contract start/end
    | 'win'                // shipped, delivered, measurable outcome
    | 'learning'           // new skill, course, deep-dive
    | 'certification'
    | 'project'
    | 'recognition'        // award, testimonial, rehire
    | 'compensation'       // bonus, raise — always private
    | 'hobby';             // chess milestone, match played
  title: string;
  detail?: string;
  org?: string;
  metrics?: { label: string; value: string }[];   // "cost" → "−40%"
  tags?: string[];         // skills touched → drives skill recency
  links?: { label: string; url: string }[];
  visibility: 'public' | 'private';
  source: 'manual' | 'email' | 'upwork-email' | 'github' | 'chess.com';
  verified: boolean;       // false = drafted by automation, not yet reviewed
};
```

Validated with **zod** (already a dependency) at build time: a malformed entry fails the build instead of shipping.

### File layout

```
content/
├─ profile.json              # layer 1
├─ log/2026/                 # layer 2 — one file per entry (clean PRs, no merge conflicts)
│  └─ 2026-10-25-tech-lead-x.json
├─ hobbies.json              # chess username, teams followed, position played
└─ sources/                  # layer 3 — generated, do not edit
   ├─ github.json
   ├─ upwork.json
   ├─ chess.json
   └─ football.json
src/lib/content/
├─ schema.ts                 # zod schemas
└─ derive.ts                 # builds today's PortfolioConfig shape from content/
```

**Migration without breakage:** `derive.ts` first outputs exactly the current `PortfolioConfig` shape, so every component keeps working on day one. `portfolio-config.json` is then retired, and `content/` becomes the single source of truth — a deliberate change to the original "config is the source of truth" rule.

### Private data — a hard rule

The repo is public, and today the whole config is bundled into client JavaScript. **Private entries (bonuses, compensation, anything under NDA) must never be committed here.** They live in a private store — a Supabase table or a separate private repo — and are never imported by the site. The public log may still say, for example, *"Recognised for outstanding delivery"* while the figure stays private.

---

## 2. Automated sources

One scheduled **GitHub Action** (`.github/workflows/sync.yml`) runs nightly. It fetches each source, writes `content/sources/*.json`, and commits only when something changed. The commit triggers a Vercel redeploy, and git history becomes a free record of the career over time.

| Source | Data | Method | Notes |
|---|---|---|---|
| **GitHub** | Repos, stars, languages, contribution calendar, recent activity | Official GraphQL API | Token stored as an Actions secret |
| **Upwork** | Earnings, Job Success, jobs, hours, reviews | **No usable API** — parsed from notification emails (§3) | Upwork blocks scrapers; email is the reliable path |
| **chess.com** | Ratings (rapid, blitz, bullet, daily, puzzles), win/loss/draw records, recent games and rating trend | Public published-data API — no key | Needs my chess.com username; send a descriptive User-Agent |
| **Football (watching)** | My club's last result, next fixture, league position | A football data API (e.g. football-data.org, free tier with key) | Free tiers cover the major European leagues; confirm my team is included |
| **Football (playing)** | Matches played, goals, position | **No source** — `hobby` entries in the log | Captured like any win (§3) |

Rules: a failed fetch keeps the last good snapshot (the site never shows empty data), and each snapshot records its `fetchedAt` time.

---

## 3. Capture — the human-only facts

All capture flows end the same way: **a drafted entry opened as a pull request**, merged from my phone.

### 3.1 Email a win → `log@abdulkarimg.com`
1. I email a few plain lines: *"Promoted to Tech Lead at X, leading 4 engineers."*
2. Cloudflare Email Routing hands the message to an **Email Worker**.
3. The Worker accepts mail **only from my own addresses** and checks the message passed authentication — anything else is rejected.
4. An LLM turns the text into a `LogEntry` (`verified: false`), asking nothing it can't infer and inventing nothing.
5. The Worker opens a PR via the GitHub API. Merging it publishes the entry.

### 3.2 Upwork → `upwork@abdulkarimg.com`
1. Change the Upwork account's notification email to `upwork@abdulkarimg.com` (the forward and Gmail label already exist).
2. A second route sends a copy to the Worker, which recognises review, payment and milestone emails.
3. It drafts updates to `sources/upwork.json` (earnings, review count, latest rating) and, for 5★ reviews, a `recognition` entry quoting the review — as a PR.
4. Payment amounts feed only the aggregate public stat (e.g. "$60K+"), rounded down to a public threshold; per-payment figures stay private.

### 3.3 Optional, later
- **Telegram bot** — `/win shipped eval suite, cut cost 40%` → same pipeline.
- **Weekly digest** — a Sunday job gathers the week's GitHub activity and merged entries, and drafts a single PR proposing updates to skills, projects and stats.

---

## 4. UI changes

| Change | Where | What it shows |
|---|---|---|
| **`/now` — changelog artifact** | New tool + slash command + landing index card | Career as release notes, newest first: *"2026.10 — Promoted to … · Shipped … · Learned …"*, filterable by type |
| **Freshness stamp** | Masthead running head | "Updated 3 days ago", from the newest verified entry or source sync |
| **GitHub artifact** | New tool `getGithub`, `/github` | Contribution heatmap, language mix, recent shipping — real, current proof of work |
| **Skills with recency** | Existing skills spec sheet | "last used Oct 2026" per tool, from log tags and GitHub languages; stale skills fade back |
| **Experience from the log** | Existing résumé artifact | Roles derived from `role` entries — a promotion appears without editing the timeline |
| **Upwork stats from source** | Landing telemetry, hire and about cards | Earnings, Job Success, hours read from `sources/upwork.json` |
| **`/hobbies` — "Off the clock" artifact** | New tool `getHobbies`, `/hobbies`, answers the existing "What do you do outside of code?" preset | See below |
| **AI twin stays current** | `/api/chat` | New `getTimeline` tool so "What have you been working on lately?" answers from the log; system prompt includes the latest entries |

### The hobbies artifact

- **Chess** — live ratings per time control with a small rating-trend chart, win/draw/loss record, best rating, a link to my chess.com profile, and (stretch goal) the final position of my latest game drawn as a board.
- **Football, watching** — my club, its last result and next fixture, refreshed nightly. No club crests or league logos (licensing); the club name set in type.
- **Football, playing** — position, recent matches and goals from `hobby` log entries.
- One line of personality to close the card, written by me, not generated.

---

## 5. Roadmap

| Phase | Scope | Done when |
|---|---|---|
| **0 · Data audit** | Section-by-section interview to correct experience, projects, skills, numbers and hobbies | Every current fact confirmed or removed |
| **1 · Schema & migration** | `content/`, zod schemas, `derive.ts` emitting today's config shape; private store decided | Site builds from `content/`, looks identical, `portfolio-config.json` retired |
| **2 · Sync pipeline** | Nightly Action: GitHub, chess.com, football | Snapshots commit automatically; failures keep last good data |
| **3 · UI** | `/now`, freshness stamp, GitHub artifact, skills recency, `/hobbies`, `getTimeline` | All new artifacts live in light and dark, phone and desktop |
| **4 · Capture** | Email Worker for `log@` and `upwork@`, PR drafting | Emailing a win produces a correct PR within a minute |
| **5 · Extras** | Telegram bot, weekly digest | Optional |

---

## 6. Decisions needed before Phase 1

- [ ] **chess.com username**
- [ ] **Football club(s) I follow** and their league — determines whether a free API covers them
- [ ] **Football I play** — position, and whether to show goals/matches publicly
- [ ] **Private store** for compensation and NDA'd details — Supabase table or private repo
- [ ] **Drafting model** for the email Worker — the site already uses Gemini; any capable model works
- [ ] **Confirm** retiring `portfolio-config.json` in favour of `content/`

## 7. Risks

| Risk | Mitigation |
|---|---|
| An LLM drafts a wrong fact | Every automated change is a PR; nothing auto-merges; entries start `verified: false` |
| Upwork changes its email format | Parser fails loudly into a PR comment; stats keep the last good value |
| Third-party API outage or rate limit | Last good snapshot kept; `fetchedAt` shown in the UI |
| Someone emails `log@` pretending to be me | Worker accepts only my sender addresses with passing authentication (DMARC is already enforced on the domain) |
| Private data leaks through the public repo or client bundle | Private entries never stored in this repo; build check fails on any `visibility: "private"` entry under `content/` |
| Secrets exposure | GitHub and API tokens live only in Actions and Worker secrets, scoped to this repo |

**Cost:** everything above fits within free tiers (GitHub Actions, Cloudflare Workers and Email Routing, chess.com API, a free football-data tier). The only variable cost is LLM drafting, which is a few emails a week.
