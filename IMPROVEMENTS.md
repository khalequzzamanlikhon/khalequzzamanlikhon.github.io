# Portfolio Improvements — Khalequzzaman Likhon

> A review of the current portfolio (`index.html`, `projects.html`,
> `publications.html`, `blog.html`, `experience.html`, `css/style.css`,
> `js/main.js`) with actionable improvements organized by priority.

---

## 1. Overall Assessment

**Grade: B+ → target A−.**

| Dimension                  | Current | Why                                                                                  |
| -------------------------- | ------- | ------------------------------------------------------------------------------------ |
| Visual design & typography | ★★★★☆   | Strong academic aesthetic, IBM Plex, consistent sidebar.                             |
| Information architecture   | ★★★★☆   | Five well-scoped pages, sensible sectioning.                                         |
| Responsiveness             | ★★★☆☆   | Sidebar drawer exists, but math on the main width and project grid could be tighter. |
| SEO & social previews      | ★☆☆☆☆   | Duplicate meta descriptions, no OG tags, no JSON-LD.                                 |
| Accessibility (a11y)       | ★★☆☆☆   | Theme toggle lacks `aria-pressed`, no `aria-current` on nav.                        |
| Content completeness       | ★★☆☆☆   | `#` placeholder links, missing photo, no real CV, broken certs URL.                 |
| Interactivity (chat/etc.)  | ★★★☆☆   | Chatbot is keyword-based; clever idea but breaks trust if users notice.              |
| Code quality               | ★★★☆☆   | Sidebar HTML copy-pasted 5×, magic-color variables, brittle keyword matching.       |

The bones are right. The hard part is the **content pass** (real assets, real
links, real photo) and the **meta layer** (SEO, OG, JSON-LD, accessibility).

---

## 2. Critical (do these first)

### 2.1 Replace placeholder assets

- **Avatar.** Replace `👤` with a real headshot (`assets/profile.jpg`,
  400×400, ~80KB). Make it round via existing `.sidebar-photo img`.
- **CV PDF.** Either add `cv.pdf` to the repo root, or point the nav link
  to a Google Drive / Notion hosted link. Currently broken.
- **Google Scholar link.** Replace
  `https://scholar.google.com` with the user's real Scholar profile.
- **Kaggle / LinkedIn / GitHub.** Confirm each username actually resolves
  to *your* profile; the GitHub username spelling
  (`khalequzzamanlikhon`) is unusual — verify.

### 2.2 Fix broken / placeholder links

Every `href="#"` is a trust-killer. Replace with real URLs:

- Publications → DOI, arXiv, IEEE Xplore, OpenReview.
- Projects → GitHub repo URL.
- Blog posts → either link to a hosted post (Medium, Hashnode, Substack,
  dev.to) or drop the cards entirely until the posts exist.

Two separate Coursera certifications currently point to the same URL
(`CBJKQJ58HP9B`). This is a copy-paste bug — the second one should link to
the actual Neural Networks certificate.

### 2.3 Authenticity of news + publications

Dates like `Jul 2026` and a "paper submitted to CVPR/ICCV 2026" imply review
decisions that haven't happened. If these are aspirational, label them
explicitly as *drafts / in preparation*. Don't claim a CVPR submission as a
fact until the camera-ready is in hand. The News section especially should
not contain fabricated career milestones.

### 2.4 Add real social preview meta tags

Every page should have:

```html
<meta property="og:type" content="profile">
<meta property="og:title" content="Khalequzzaman Likhon — Machine Learning Engineer">
<meta property="og:description" content="… unique per page …">
<meta property="og:image" content="https://…/assets/profile-og.jpg">
<meta property="og:url" content="https://…/">
<meta name="twitter:card" content="summary_large_image">
```

Generate one OG image (1200×630) and reuse across pages.

### 2.5 Per-page meta description

Each page must have a *unique* `<meta name="description">`:

- `index.html` → "Khalequzzaman Likhon — real-time computer vision, multimodal AI at Accelx Inc."
- `projects.html` → "Production ML projects: weapon detection, fall detection, OCR, threat intel."
- `publications.html` → "Publications on CLIP-based fall detection, attention ensembles, ECG CNNs."
- `blog.html` → "MLOps, computer vision, and LLM engineering notes from production."
- `experience.html` → "Accelx Inc. ML Engineer; BSc CS at AUST; certifications and skills."

### 2.6 Add JSON-LD `Person` schema

Add to `index.html`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Khalequzzaman Likhon",
  "jobTitle": "Machine Learning Engineer",
  "affiliation": {"@type": "Organization", "name": "Accelx Inc."},
  "sameAs": [
    "https://github.com/khalequzzamanlikhon",
    "https://linkedin.com/in/khalequzzaman-likhon",
    "https://scholar.google.com/citations?user=…"
  ],
  "url": "https://…/"
}
</script>
```

This is what gives you the rich card in Google search.

---

## 3. High Priority (visual / UX)

### 3.1 Sidebar HTML duplication

The full sidebar markup is **paste-copied verbatim** in every HTML file
(`<aside class="sidebar">` *and* `<div class="mobile-sidebar">`). Any edit
has to be made five times.

**Fix:** Either

1. Move to a tiny static-site generator (11ty, Hugo), or
2. Generate the sidebar client-side with one `JS` snippet that injects
   the markup on `DOMContentLoaded`, or
3. At minimum, wrap a `<script>` that imports
   `partials/sidebar.html` via `<object>` or fetch (works on GitHub Pages
   via `fetch()` if you serve it as a `.txt`/`.js` snippet).

Pick option 2 — it's the smallest change and preserves the no-build
philosophy.

### 3.2 Color cohesion

Currently `--accent: #1e40af` (blue) and `--nav-bg: #1a312c` (dark green)
are unrelated. Choose one:

- Make `--nav-bg` match the accent family (e.g. `#1e3a8a` or
  `--accent` itself with reduced lightness).
- Or use a deep neutral for the top nav (`#0f172a`) and let blue accents
  stay reserved for CTAs.

### 3.3 Theme-color meta

`<meta name="theme-color" content="#ffffff">` should match the active
theme. Move it from static HTML to `js/main.js`:

```js
function syncThemeColor(theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  meta.setAttribute('content', theme === 'dark' ? '#0a0a0f' : '#ffffff');
}
```

### 3.4 The skill tags grid looks sparse

The user has 6 striking skill categories but `display: grid;
grid-template-columns: 1fr;` on `skills-grid` makes the page feel empty
on wide screens. Make it 2 columns at ≥900px and 3 at ≥1200px.

### 3.5 Project-grid clamp

Cards use `-webkit-line-clamp: 2`, which truncates important context
("<100ms latency on multi-camera networks…"). Bump to 3 lines on wide
viewports, keep 2 on mobile.

### 3.6 "Selected Projects" on the home page links to `projects.html`

…but doesn't deep-link to a project. If you keep the simple list, that's
fine — but if you add **case-study modals** later (recommended, see §6),
this is the place.

### 3.7 Live status / currently building

Recruiters and collaborators love this. Add a small green-dot line under
the about paragraph:

```
🟢 Currently leading the computer-vision team at Accelx,
   working on vision-language models for surveillance event detection.
```

### 3.8 Hero block on the home page

Right now the about page opens with text. Consider adding a one-liner
**hero** above the prose:

> *Khalequzzaman Likhon · Building real-time computer vision and
> multimodal AI for safety-critical systems.*

with a **Resume** CTA and a **Contact** CTA below.

---

## 4. Medium Priority (interactive / content)

### 4.1 Replace keyword chatbot with intent taxonomy

`findAnswer` splits queries on whitespace and matches anything ≥3 chars.
Concretely, "I love my IP" currently matches nothing reasonable. Worse,
a query like "Hi" of length 2 is ignored, but "Hi!" is.

Replace keyword matching with a small **intent taxonomy**:

```js
const intents = [
  { id: 'fall',     match: /(fall|fall detection|clip)/i,        answer: … },
  { id: 'weapon',   match: /(weapon|gun|knife|safe)/i,           answer: … },
  { id: 'contact',  match: /(contact|email|reach|talk|phone)/i,  answer: … },
];
```

Then optional fallback to a real API (OpenAI function-calling, hosted
RAG over your own blog/project markdown). Even a small RAG setup
(embedding your blog + projects into a vector index) would 10× the
chatbot's credibility.

### 4.2 Make the chatbot own its limits

If keeping a keyword bot, **say so** in the welcome message:

> "I'm a small Q&A widget. For detailed questions, please email me at
> khalequzzamanlikhon@gmail.com."

This avoids the trust cliff when the user types something it doesn't
know.

### 4.3 Blog post pages

`blog.html` has 6 listed posts but no link to actual articles. Either:

1. Link to hosted posts (Hashnode, Medium, dev.to), or
2. Add an in-site reader: click a card → load a markdown file via `fetch`
   into a modal (would let the portfolio host content without a CMS).

### 4.4 Project detail pages

Currently each `pub-item` and `project-card` links to `projects.html`
itself. Add per-project pages like `projects/fall-detection.html` with
stack, motivations, architecture diagram, results table, lessons learned.
That doubles the surface area for SEO.

### 4.5 Sortable, paginated publications

The pub year dropdown only has `2026`, `2025`, `2020`. Add `2024`, `2023`,
`2022`, `2021` if you have anything in those years; otherwise remove the
empty `<option>`s.

### 4.6 Add visitor analytics (privacy-friendly)

Use Plausible or Umami for visitor counts. Even 0 data is useful — let
recruiters know the page exists.

### 4.7 Add a sitemap and `robots.txt`

GitHub Pages doesn't generate these. Add a `sitemap.xml` and
`robots.txt` to the root.

### 4.8 RSS feed for the blog

`/blog.xml` using atom 1.0. Lets researchers subscribe.

---

## 5. Accessibility (a11y)

### 5.1 Theme toggle button

```html
<button class="theme-toggle-btn"
        onclick="toggleTheme()"
        aria-label="Toggle dark/light mode"
        aria-pressed="false">
```

Update `aria-pressed` in `js/main.js` whenever the theme changes.

### 5.2 Active nav state

Replace `class="active"` with `class="active" aria-current="page"` on
the current page's nav link. Apply the same to `mobile-sidebar`.

### 5.3 Skip-to-content link

Right after `<body>`:

```html
<a class="skip-link" href="#main">Skip to content</a>
```

with CSS that visually hides it until focused.

### 5.4 Focus styles

`:focus-visible` styles on links, buttons, inputs. The accent color
should show a clear outline.

### 5.5 Chat widget close-on-outside-click bug

```js
document.addEventListener('click', function(e) {
  if (!widget.contains(e.target)) panel.classList.remove('open');
});
```

This fires on the toggle button itself, but `widget` contains it so the
guard works. However, clicks *inside the chat input* that bubble up also
keep the panel open — fine. But if the user clicks a quick-question
button while the panel is closed, the click bubble closes the panel
*while* the question is being sent. Verify in a manual test.

Better: only close on `mousedown` outside, or only when the target isn't
interactive.

### 5.6 Form labels on the chat

`<input type="text">` with a placeholder is not enough for screen
readers. Add `aria-label="Type your question"`.

### 5.7 `lang` attribute

All pages have `lang="en"` — good. Consider also `<html lang="en-BD">`
if most of your audience is in Bangladesh.

---

## 6. Polish / nice-to-have

### 6.1 A reading-mode toggle

A click that strips backgrounds and widens the column. Useful for blog
posts.

### 6.2 A subtle entrance animation

Each section fades up 4px on scroll into view. Use
`IntersectionObserver` and respect `prefers-reduced-motion`.

```js
const io = new IntersectionObserver(entries => {
  entries.forEach(e => e.isIntersecting && e.target.classList.add('in'));
}, { threshold: 0.1 });
document.querySelectorAll('.scroll-section, .pub-item, .project-card')
        .forEach(el => io.observe(el));
```

```css
@media (prefers-reduced-motion: no-preference) {
  .scroll-section, .pub-item, .project-card {
    opacity: 0;
    transform: translateY(8px);
    transition: .35s ease;
  }
  .in { opacity: 1; transform: none; }
}
```

### 6.3 Project badges & metrics next to titles

> **FallGuard AI** — Production · 🚀 8M inferences/day

Recruiters scan numbers. Pin key metrics to each card.

### 6.4 A "press kit" line

Add a footnote on the about page: *"For media / press inquiries, email
…"* — small but signals you've thought about it.

### 6.5 Reduce motion language

Wrap any future animations in
`@media (prefers-reduced-motion: no-preference)`.

### 6.6 Typographic rhythm

`line-height: 1.75` on body — slightly high; `1.6` reads better for a
15px base.

### 6.7 A 404 page

GitHub Pages shows a generic 404. Add `404.html` that matches the design.

### 6.8 Email TOC & PGP key

Scholars like to send private mail. Optionally include your PGP
fingerprint on the contact area.

---

## 7. Code quality & cleanup

### 7.1 Use CSS variables consistently

`#1e40af` is hardcoded twice in dark mode and once in `:root`. Replace
with `var(--accent)`. Already true elsewhere — but check for stragglers.

### 7.2 Replace emoji icons with inline SVG (already done) ✓

Just double-check no external icon font is required (it's not).

### 7.3 Move `js/main.js` to modules / split

Even without a bundler, split into:

```
js/
  components/
    theme.js
    chat.js
    filters.js
  main.js            // orchestrator
```

Then `<script type="module" src="js/main.js">`. Reduces coupling.

### 7.4 Add basic linting

- `html-validate` for HTML.
- `stylelint` for CSS.
- `eslint` for JS.

Even just a `Makefile` or `npm` script that runs them as CI.

### 7.5 Compress Google Fonts

Use `&display=swap` (already present) **and** limit the weights actually
used (`300,400,500,600,700`). Currently requesting 5 weights × 2 families
= 10 font files; consider preloading only the weights visible above the
fold.

### 7.6 Inline critical CSS

On the home page, inline the CSS needed for above-the-fold in a `<style>`
tag and defer the rest. Faster first paint.

### 7.7 Consider a pre-commit hook

`npx prettier --write .` to keep formatting consistent.

---

## 8. Suggested Roadmap

A pragmatic order if you have a weekend:

**Day 1 — Authenticity**

- [ ] Add real profile photo.
- [ ] Wire real CV PDF & real social URLs.
- [ ] Replace `#` placeholders with actual links (or remove).
- [ ] Fix duplicate Coursera URL.
- [ ] Mark aspirational news items as `in preparation`.

**Day 2 — Meta layer**

- [ ] Per-page `<meta name="description">`.
- [ ] OG + Twitter Card meta.
- [ ] One OG image.
- [ ] JSON-LD `Person` schema.
- [ ] `sitemap.xml` + `robots.txt`.
- [ ] `theme-color` synced with theme.

**Day 3 — UX polish**

- [ ] Hero block on home page with two CTAs.
- [ ] "Currently building… 🟢" line.
- [ ] Skill grid → 2/3 columns by viewport.
- [ ] Section fade-in animation (with reduced-motion guard).
- [ ] 404 page.

**Day 4 — Content depth**

- [ ] Project detail pages (even one: `FallGuard AI`).
- [ ] Hook chatbot fallback to a real RAG or hosted per-page Q&A.
- [ ] Either host real blog posts or remove the blog cards.

**Day 5 — Accessibility + analytics**

- [ ] a11y audit (axe / Lighthouse).
- [ ] Add Plausible / Umami.
- [ ] Add RSS for blog.

---

## 9. Quick wins you can ship in 15 minutes

These hide in plain sight — each one is a 1-line change with outsized
impact:

1. Fix the duplicate Coursera URL.
2. Replace `https://scholar.google.com` with your real Scholar profile.
3. Add `aria-current="page"` on active nav links.
4. Add `<meta name="theme-color">` synced with theme toggle.
5. Add `<a class="skip-link" href="#main">`.
6. Add a single line `OG image` (1 image, 5 pages benefit).
7. Add a *currently building* line under the about paragraph.
8. Add a 404 page styled to match.
9. Compress the profile photo to ~80 KB.
10. Move `--nav-bg` into the same color family as `--accent`.

After those 10, the site feels meaningfully more complete.

---

## 10. What NOT to change

The portfolio is already good at:

- **Typography pairing** (IBM Plex Sans + Mono) — keep it.
- **Sidebar layout** in the academic style — keep it.
- **Vanilla JS / no framework** philosophy — keep it for GitHub Pages.
- **Dark mode** via `data-theme` + `localStorage` — keep the approach.
- **Inline SVG icons** — keep them (no external icon font dependency).

These are deliberate, restrained choices and they are right for an
academic ML researcher who values clarity over flourish.

---

*Last reviewed: July 2026 — maintain this file as you ship changes.*
