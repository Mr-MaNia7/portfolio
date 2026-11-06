# SEO audit: abdulkarimg.com

**Date:** 2026-11-06
**Audited URL:** https://www.abdulkarimg.com, the live production site. The bare domain `abdulkarimg.com` 308-redirects there.
**Tooling:** the claude-seo plugin, v2.5.0. It ran specialist checks for technical, content, structured data, sitemap, performance, visual, AI-search (GEO), agent readiness, backlinks and search experience (SXO), and the main findings were then checked by hand against the live site and this repo.

## Summary

**Overall SEO score: about 64/100.** The audit ran with an estimated performance score, which gave about 63. The measured Lighthouse results, added later the same day, raised it to 64. Nothing blocks indexing, and the technical basics are good. The score comes down to three problems:

1. **The site names a redirecting address as its official URL.** The canonical tag, `og:url`, the sitemap, robots.txt and the JSON-LD all use the bare `abdulkarimg.com`, which redirects to `www`.
2. **robots.txt blocks `/_next/`.** That stops Googlebot loading the site's own scripts, styles and optimized images, which it needs to render the page.
3. **Most of the proof is out of reach of crawlers.** The bio, the employment history, the Turing figures, the thesis and the answers to the question cards only appear after a click, in chat presets or an `ssr:false` dialog. Search engines and AI answer engines never read them.

**A search for the owner's full name returned 19 results, all of them other people.** The site, LinkedIn and Upwork were all missing. Without Search Console it's unknown whether the site is unindexed or just ranks low.

Most of what's wrong is copy and structure, so the planned copy rewrite is the main fix. Section 4 lists what the rewrite needs to cover.

## 1. Scores

| Category (weight) | Score | Main issue |
|---|---|---|
| Technical (22%) | 68 | Canonical host points at a redirect; `/_next/` disallowed |
| Content quality (23%) | 64 | Strong proof exists but stays behind a click |
| On-page (20%) | 52 | H1 has no name, role or service |
| Structured data (10%) | 58 | No `@id`; image is a placeholder SVG |
| Performance (10%) | ~95 | Lighthouse: mobile 98, desktop 79 then 99; about 231 KiB of unused JS. No real-user Core Web Vitals yet |
| AI search readiness (10%) | 48 | No server-rendered bio or answers; no `llms.txt` |
| Images (5%) | 82 | Good OG image; covers are 4.6 MB of PNG/JPG |

## 2. What already works

- **The landing page is prerendered** (`x-nextjs-prerender: 1`, about 65 KB of HTML, about 950 words without JavaScript) and served from Vercel's edge cache. TTFB is about 0.48 s.
- **The AI SDK is not in the first load.** All 13 first-load scripts were downloaded and searched for `useChat`, `DefaultChatTransport`, `@ai-sdk` and `streamText`, and none matched.
- **Static scripts are cached for a year:** `cache-control: public,max-age=31536000,immutable`.
- **AI crawlers all get the full page.** GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended and CCBot each received HTTP 200 and the same prerendered HTML.
- **The accessibility tree is clean:** 53 interactive elements, none of them unnamed, and 11 landmarks.
- **The OG image is solid:** 1200×630, with complete OG and Twitter meta tags.
- **The project cover images** have descriptive alt text and are lazy-loaded.
- **There is a valid Person JSON-LD block** in `src/app/layout.tsx`.
- **Unknown URLs return a real 404.**

## 3. Action plan, in order

| # | Action | Effort | Depends on | How you'll know it worked |
|---|---|---|---|---|
| 1 | Make `www` the official host everywhere (details below) | 15m | none | view-source canonical shows `https://www.abdulkarimg.com/`; Search Console's "Google-selected canonical" matches |
| 2 | Fix robots.txt: remove `Disallow: /_next/` and the `Host:` line, keep `/api/` | 5m | none | Search Console's URL Inspection reports no resources blocked by robots.txt |
| 3 | Set up Google Search Console and submit `https://www.abdulkarimg.com/sitemap.xml` | 20m | 1 | URL Inspection reports "URL is on Google"; impressions start appearing for the name |
| 4 | Rewrite the copy (section 4) | your rewrite | none | the site appears for its own name within 2–6 weeks |
| 5 | Put the proof in the initial HTML: add `/work/[slug]` case-study pages linked with real `<a>` tags | 4–6h | 4 | the sitemap lists more than 1 URL; impressions for project and stack queries |
| 6 | Update the structured data (section 5, and Appendix A) | 1h | 1 | the Rich Results Test is clean and shows one connected set of nodes |
| 7 | Add `/llms.txt` (Appendix B) | 30m | 1 | it returns 200 as `text/plain` |
| 8 | Get links back to the site (section 7) | 1h + writing | 1 | the links appear as referring domains in Search Console |
| 9 | Performance work (section 6) | 2–3h | none | Lighthouse mobile scores 90+ |
| 10 | Add security headers in `next.config.ts` | 30m | none | `curl -I` shows the new headers |
| 11 | Check the Vercel domain setup: `www` primary, bare domain redirecting | 10m | none | repeated requests to the bare domain stay under 1 s |

### Step 1 in detail: the official host

`NEXT_PUBLIC_SITE_URL` appears to be unset in production, so every fallback is used and they all point at the bare domain. Two changes:

- Set `NEXT_PUBLIC_SITE_URL=https://www.abdulkarimg.com` in Vercel, for all environments.
- Change the hard-coded fallbacks to match:
  - `src/app/layout.tsx:27`, which sets `metadataBase`, canonical, `og:url`, `og:image` and the JSON-LD URLs
  - `src/app/robots.ts:3`
  - `src/app/sitemap.ts:3`
  - `src/app/resume.pdf/route.ts:8`
  - `src/lib/resume-pdf.tsx:112`

The bare domain also stalled intermittently during the audit: one load took 78 s and one connection took 10 s. Later attempts took about 0.12 s. The redirect itself adds about 0.85 s, so every internal and external link should use `www`.

### Step 2 in detail: robots.ts

Remove the `/_next/` disallow and the non-standard `Host:` line, and point `Sitemap:` at `www`. Content-Signal is optional; it's a proposal that some AI crawlers honour. Next's `Robots` type has no field for it, so adding it would mean a custom route handler.

### Sitemap

Use the final `www` URL. Set `lastModified` to the date the content actually changed, not the build time. `changefreq` and `priority` can be removed, because Google ignores them.

```ts
import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.abdulkarimg.com';
// Bump when homepage content meaningfully changes (not every build).
const CONTENT_LAST_MODIFIED = '2026-11-01';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteUrl}/`, lastModified: CONTENT_LAST_MODIFIED }];
}
```

Add the `/work/*` pages from step 5 here once they exist.

## 4. What the rewrite needs to cover

Every fact must come from `portfolio-config.json` or be supplied by the owner. Do not invent metrics.

### Realistic searches to target

- **Your name**, "Abdulkarim G. Mohammed" and "abdulkarimg". These are the main target.
- **Long-tail phrases**, such as "AI voice agent developer", "Supabase multi-tenant developer" and "SOC 2 engineer".
- **Not head terms** like "freelance AI engineer" or "LLM developer". One page with no backlinks can't rank for them.
- **Not "senior full-stack AI engineer freelance".** That search is almost entirely job listings, so the page is the wrong type for it.

### Title and meta description

- **Title, 58 characters:** `Abdulkarim G. Mohammed — Freelance AI & Full-Stack Engineer`
- **Meta description, about 155 characters:** the current one (`layout.tsx:35`) is 236 characters and repeats itself. Suggested replacement:
  > Freelance senior full-stack & AI engineer. I build AI voice agents, multi-tenant Supabase SaaS and SOC 2-ready platforms. Top Rated Plus, 100% Job Success.

### H1, at `src/components/chat/chat-landing.tsx:140`

The H1 currently reads "Interview my AI twin before you hire me", which carries no name, role or service. Put the name, role and what you build in it, for example "Abdulkarim G. Mohammed, freelance AI and full-stack engineer". Move the twin line to the CTA button or to a small line above the H1.

### Intro paragraph, at `chat-landing.tsx:143`

The intro is generic and repeats "AI products… production". A draft that uses only facts from the config:

> I build AI voice agents, LLM features and the multi-tenant SaaS platforms under them, then take them through security review and SOC 2 so enterprise buyers can sign. Since June 2025 I've done that at AIVI: 500+ merged PRs across backend, frontend, DevOps and security. I work from Addis Ababa (UTC+3) on US and EU hours. Ask my twin what you'd ask in a first call.

### About paragraph

Add an About paragraph of about 150 words, rendered on the server. This is the biggest single gain for AI citations. Open with a sentence an answer engine can quote as it stands: "Abdulkarim G. Mohammed is a freelance senior full-stack and AI platform engineer based in Addis Ababa, Ethiopia…". Then cover years of experience, Upwork status, current work at AIVI, Eaglix Tech, and the Google work via Turing.

### Other copy changes

- **Use the word "freelance".** Today it appears only in the meta keywords. Change `portfolio-config.json:33` to something like "Available now for freelance contracts, full- or part-time".
- **Put the strongest numbers on the landing page.** The Turing figures (85% of tasks approved, 20% less time per task than peers) are currently only inside the dialog.
- **Render answers to the 8 question cards** (`chat-landing.tsx:454-468`) as static text, for example in `<details>` elements. Right now only the buttons are in the HTML. Keep the twin as the optional deeper answer.
- **Give section headings topic words.** Examples:
  - "AIVI case study: from a 45-day trial to the whole voice AI platform"
  - "Products I've shipped: AI, SaaS and Supabase builds"
  - "Services: AI voice agents, multi-tenant SaaS, cloud and SOC 2"
  - "Client reviews: 5.0★ and Top Rated Plus on Upwork"
  - "FAQ: questions to ask before you hire me"
- **Fix the reviews header at `chat-landing.tsx:400`.** It reads "5.0★ from AIVI, Svetness, Aladia" and sits above verbatim quotes from other clients. Those three ratings have no written text, so say that plainly, for example "5.0★ ratings from AIVI, Svetness and Aladia. The quotes below are verbatim from other Upwork clients." Link to the reviews on Upwork.
- **Quantify outcomes, not output.** Only the owner can supply these:
  - AIVI: number of regions, concurrent calls tested, SOC 2 status (Type I or II, done or in progress)
  - Svetness: a result rather than "3 channels, one dashboard"
  - Alertix: any metric at all
  - ATCOM: what the "~35%" measures
- **Smaller items:**
  - The stats block appears twice in the HTML (`chat-landing.tsx:168` and `:429`).
  - "enterprise buyers" appears three times.
  - The nav label "Twin" is vague.
  - The OG image alt text says "AI/LLM Specialist", which doesn't match the title (`src/app/opengraph-image.tsx:4`).
  - The `page-type`, `site-kind`, `category` and `keywords` meta tags are ignored by search engines and can go.

### Structure, after the rewrite

- **Project cards are `<button>`s, so the site has no internal links at all.** Add `/work/aivi`, `/work/svetness` and `/work/aladia` as static pages, each with its own title, description and dated `CreativeWork` schema, and link to them with real `<a>` tags.
- **The `ProjectDialog` is `ssr:false`** (`chat-landing.tsx:17-20`). Either render its content on the server or move it onto the new work pages.
- **Optional:** a service page such as `/ai-voice-agent-development`, if you want to compete for "hire" searches. Those results are dominated by Upwork, Toptal and agency pages.

## 5. Structured data

The current block, at `src/app/layout.tsx:105-154`, is valid. What needs fixing:

- It has no `@id`, and there is no `WebSite` or `ProfilePage` node.
- `image` is `/headshot-placeholder.svg`. A real raster headshot (JPG, PNG or WebP, at least 400 px square) is already on the backlog.
- `addressLocality` is "Addis Ababa, Ethiopia". Split it into `addressLocality` and `addressCountry`.
- It has no `alternateName`. "Abdulkarim G. Mohammed" stays as the display name; `alternateName` only links the other name used on GitHub and in git, so the profiles connect without renaming any of them.
- `sameAs` is missing the Zenodo thesis DOI and eaglix.dev, and there is no `founder` link to Eaglix Tech.

**Not recommended:**
- `Review` or `AggregateRating` for on-site testimonials, because self-serving reviews aren't eligible for rich results.
- `FAQPage`, because Google retired FAQ rich results on 2026-05-07.

The replacement is in Appendix A.

## 6. Performance

### Lighthouse results, measured 2026-11-06

These come from PageSpeed Insights, which runs Lighthouse 13.6.

| | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Mobile | 98 | 100 | 100 | 100 | 0.9 s | 60 ms | 0 |
| Desktop, run 1 | 79 | 100 | 100 | 100 | 0.7 s | 470 ms | 0 |
| Desktop, run 2 | 99 | 100 | 100 | 100 | 0.2 s | 100 ms | 0 |

- **The two desktop runs differ** because PageSpeed tests on shared machines and the results vary. Run 1's 2.2 s of main-thread work points to JS cost as the thing to watch.
- **Real-user data (CrUX):** there is none yet, because the origin doesn't have enough Chrome traffic. INP can only be measured from real users, so it stays unknown until CrUX publishes data.
- **Lighthouse flags:**
  - Reduce unused JavaScript, est. 231 KiB
  - Render-blocking requests, est. 280 ms on mobile
  - Improve image delivery, 39–74 KiB
  - Legacy JavaScript, 14 KiB
  - Images without explicit `width` and `height`
- **One accessibility issue:** an element's visible text doesn't match its accessible name (`label-content-name-mismatch`). PageSpeed doesn't say which element, so run Lighthouse in Chrome DevTools to find it. The `aria-label`s in `src/components/reviews.tsx` and `src/components/chat/` are the likely candidates.

### From static evidence

- **First-load JS is about 990 KB raw, about 308 KB compressed, across 13 chunks.** That is heavy for a prerendered page, and Lighthouse estimates 231 KiB of it goes unused. Run a bundle analyzer to see what's in the largest chunks; the AI SDK is confirmed absent.
- **Cover images in `public/covers` are 130–297 KB each, about 4.6 MB in total.** Add `images.formats: ['image/avif', 'image/webp']` to `next.config.ts` and resize the source files to about 1200 px wide.
- **`avatar.svg` goes through `/_next/image`,** which generates 15 width variants up to 3840w for a 32–40 px element. Serve it as `unoptimized` or as a plain `<img>`.
- **The mobile "Hire me" button is about 86×40 px.** Make it at least 48 px tall for touch, and enlarge the hamburger icon too.
- **The mobile chat header truncates to "Abdulkarim's AI tw…".** Shorten the title or drop the timezone block on narrow screens.
- **HSTS is `max-age=63072000` only.** Consider adding `includeSubDomains`, and `preload` once you're sure.

### Security headers

The only security header sent today is HSTS. Add these in `next.config.ts`:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `frame-ancestors` (in a CSP) or `X-Frame-Options`
- `Permissions-Policy`

## 7. Links back to the site and identity

- **GitHub:** only the repo page `github.com/Mr-MaNia7/portfolio` links to the site, with rel=nofollow. Add `https://www.abdulkarimg.com` to the profile's Website field.
- **LinkedIn and Upwork** block bots, so check by hand that LinkedIn's Contact info and Featured section link to the site.
- **Write 2–3 case-study posts** on dev.to or Hashnode that link back. Good topics are the AI-twin portfolio build and the AIVI, Svetness and Aladia work, with client permission.
- **Ask clients for a "built by" credit or link** where that's appropriate.
- **Later, for a stronger identity:** a short YouTube demo of the twin or the voice-agent work, and a Wikidata item.

## 8. Not yet measured

| Gap | Why | What it needs |
|---|---|---|
| Real-user Core Web Vitals, including INP | CrUX has no data for the origin yet, because of low Chrome traffic | More traffic; recheck in a few months. Lighthouse lab results are in section 6. |
| Indexing status, impressions, queries | The Domain property is verified, but the Search Console API needs a quota project on the gcloud sign-in | `gcloud auth application-default set-quota-project <your-project-id>` |
| Common Crawl link graph | The download timed out after about 8 minutes | A rerun in the background; no key needed |
| Domain authority and referring domains | No Moz, Bing or DataForSEO keys | Optional: a free Moz API key |

After the rewrite ships, capture a baseline with `/seo drift baseline https://www.abdulkarimg.com` so later changes can be compared against it.

## Appendix A: replacement JSON-LD

Replaces the object passed to `JSON.stringify` at `src/app/layout.tsx:108-152`. Build the `@id`s and URLs from `siteUrl` in code. Before shipping:

- Swap `REAL-HEADSHOT.jpg` for the real photo path.
- Confirm the `alternateName` value.
- Add any further `sameAs` URLs you want listed.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.abdulkarimg.com/#website",
      "url": "https://www.abdulkarimg.com/",
      "name": "Abdulkarim G. Mohammed · Portfolio",
      "inLanguage": "en",
      "publisher": { "@id": "https://www.abdulkarimg.com/#person" }
    },
    {
      "@type": "ProfilePage",
      "@id": "https://www.abdulkarimg.com/#profilepage",
      "url": "https://www.abdulkarimg.com/",
      "isPartOf": { "@id": "https://www.abdulkarimg.com/#website" },
      "mainEntity": { "@id": "https://www.abdulkarimg.com/#person" }
    },
    {
      "@type": "Person",
      "@id": "https://www.abdulkarimg.com/#person",
      "name": "Abdulkarim G. Mohammed",
      "alternateName": "Abdulkarim Getachew",
      "jobTitle": "Senior Full-Stack & AI Platform Engineer",
      "url": "https://www.abdulkarimg.com/",
      "image": "https://www.abdulkarimg.com/REAL-HEADSHOT.jpg",
      "description": "Senior full-stack and AI engineer. I take AI products to production and get them ready for enterprise buyers, from multi-tenant backends and multi-region infrastructure to voice agents.",
      "address": { "@type": "PostalAddress", "addressLocality": "Addis Ababa", "addressCountry": "ET" },
      "sameAs": [
        "https://www.upwork.com/freelancers/~01dc65c291b2936bc3",
        "https://github.com/Mr-MaNia7",
        "https://www.linkedin.com/in/abdulkarim-mohammed-b3b0201b1/",
        "https://doi.org/10.5281/zenodo.23663622"
      ],
      "alumniOf": { "@type": "CollegeOrUniversity", "name": "Addis Ababa University" },
      "worksFor": { "@type": "Organization", "name": "AIVI", "url": "https://aivi.io" },
      "founder": { "@type": "Organization", "name": "Eaglix Tech", "url": "https://www.eaglix.dev" },
      "knowsAbout": ["Full-Stack Development", "Voice AI", "Multi-tenant SaaS", "Multi-region infrastructure", "SOC 2", "Reinforcement learning", "Supabase", "Kubernetes", "Next.js", "TypeScript", "Python", "Go"]
    }
  ]
}
```

Strictly, `founder` is a property of the Organization rather than the Person. If you'd rather model it that way, add an `Organization` node for Eaglix Tech with `"founder": { "@id": "…#person" }`.

## Appendix B: draft llms.txt

Serve this from `src/app/llms.txt/route.ts` as `text/plain`. Every fact in it comes from `portfolio-config.json`.

```
# Abdulkarim G. Mohammed

> Senior Full-Stack & AI Platform Engineer in Addis Ababa, Ethiopia (EAT, UTC+3), overlapping US and EU hours. Builds AI products and voice agents, multi-tenant SaaS on Supabase/Postgres, Kubernetes/Terraform infrastructure, SOC 2 readiness and Next.js frontends. Upwork Top Rated Plus, 100% Job Success. Available now for full- or part-time remote contracts.

## Main
- [Portfolio](https://www.abdulkarimg.com/): bio, experience, projects, availability, "Interview my AI twin" chat
- [Resume (PDF)](https://www.abdulkarimg.com/resume.pdf): current resume

## Contact
- Email: hello@abdulkarimg.com (typical response 0-4 hours)

## Related
- [AIVI](https://aivi.io): current employer, AI voice agents and CRM
- [Eaglix Tech](https://www.eaglix.dev): agency founded by Abdulkarim, teams of Ethiopian engineers
```
