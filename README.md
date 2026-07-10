# Minecraft Plugin Developer Portfolio

A dark, gold-accented portfolio site built for GitHub Pages. No build step, no framework — plain HTML/CSS/JS.

## 1. Personalize the content

- **Name & links** — find/replace `Zafar`, `you@example.com`, and the placeholder Discord/GitHub/YouTube URLs across `index.html`, `contact.html`, `projects.html`, and the footer in every page.
- **Résumé** — add your own `assets/resume.pdf`, or remove the "Résumé ↓" link from the nav in each HTML file if you don't want one.
- **Projects** — edit the cards in `projects.html` (and the featured one in `index.html`) with your own plugins.
- **Stats / timeline / skills** — numbers live directly in `index.html` (`data-count`, `data-level` attributes).

## 2. Add your images and videos

Drop files straight into:

```
assets/images/   → png, jpg, jpeg, webp, gif, avif
assets/videos/   → mp4, webm, mov
```

The gallery page loads whatever is in those folders **automatically** — you never edit HTML to add media. Two ways this works, in order:

1. **GitHub API (default, zero setup after step 3 below).** The page calls `https://api.github.com/repos/OWNER/REPO/contents/assets/images` at runtime and lists whatever's there. This only works once your site is pushed to a real GitHub repo (it reads from the repo, not your local files).
2. **`data/manifest.json` (fallback).** If the API call fails (offline while testing locally, hit the public rate limit, etc.), the gallery falls back to this file. Regenerate it any time with:
   ```
   node scripts/generate-manifest.js
   ```
   Run that locally before you `git push` if you want the fallback to always be accurate. It's optional — the GitHub API path covers most visitors.

**Important:** open `js/gallery.js` and set these three lines to your actual repo:

```js
owner: 'YOUR-GITHUB-USERNAME',
repo: 'YOUR-REPO-NAME',
branch: 'main',
```

## 3. Deploy to GitHub Pages

1. Create a new GitHub repository and push this folder's contents to it.
2. On GitHub: **Settings → Pages → Source** → deploy from the `main` branch, root folder.
3. Your site goes live at `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO-NAME/`.
4. Update `robots.txt` and `sitemap.xml` with that same URL.

Large video files: GitHub has a 100MB per-file hard limit and recommends keeping repos under ~1GB. If your clips are large or numerous, consider Git LFS, or host video elsewhere (e.g. a CDN or YouTube unlisted links) and swap the `<source>` in `js/gallery.js` accordingly.

## 4. Structure

```
portfolio/
├── index.html          Home: hero, about, stats, tech stack, timeline, contact CTA
├── projects.html        Full project grid with search + category filters
├── gallery.html         Auto-loaded image masonry + video grid
├── contact.html         Social links + contact form
├── 404.html              Custom not-found page
├── css/
│   ├── style.css         Design tokens, layout, components
│   ├── animations.css    Keyframes, respects prefers-reduced-motion
│   └── responsive.css    Tablet + mobile breakpoints
├── js/
│   ├── app.js             Nav, preloader, scroll reveals, counters, ripple, filters
│   ├── gallery.js         GitHub API / manifest loader, masonry, lightbox, video grid
│   └── particles.js       Lightweight ambient canvas particles for the hero
├── assets/
│   ├── images/            Put screenshots here
│   ├── videos/            Put gameplay clips here
│   ├── icons/              favicon.png goes here
│   └── fonts/               (optional — Google Fonts are loaded via CDN by default)
├── data/manifest.json     Fallback file list for the gallery
├── scripts/generate-manifest.js   Regenerates manifest.json locally
├── robots.txt / sitemap.xml       Basic SEO
└── README.md
```

## 5. Notes

- **Fonts:** Space Grotesk (headings), Inter (body), JetBrains Mono (code/labels/stats) — loaded from Google Fonts CDN. For a fully offline site, download the `.woff2` files into `assets/fonts/` and swap the `<link>` tags for `@font-face` rules.
- **Contact form:** ships wired to `mailto:` (opens the visitor's email client) since GitHub Pages can't run backend code. For an in-page "message sent" flow, point the form's `action` at a service like Formspree.
- **Performance:** images use `loading="lazy"`; videos use `preload="metadata"` so nothing downloads in full until played.
- **Accessibility:** visible focus states, `prefers-reduced-motion` respected site-wide, alt text generated from filenames.
