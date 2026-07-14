# CLAUDE.md

Notes for working on the **Pascal** Hugo theme.

## What this is

A clean, modern blog theme for Hugo: a two-column card layout with a deep-charcoal
palette, crisp typography, and subtle motion. Fast, responsive, light/dark mode.
The design is our own — it does not follow any other Hugo theme.
This repo is the **theme itself**, not a site. The `exampleSite/` folder is used
to preview and test it.

## How to preview

```bash
cd exampleSite
hugo server --disableFastRender    # http://localhost:1313
```

The example site finds the theme via a symlink: `exampleSite/themes/pascal -> ../..`.
If it's missing, recreate it:

```bash
cd exampleSite && mkdir -p themes && ln -sfn ../.. themes/pascal
```

To just check it builds:

```bash
cd exampleSite && hugo --gc
```

## Structure

```
layouts/
  _default/baseof.html    # HTML shell — every page extends this
  index.html              # homepage (post list or profile mode)
  _default/single.html    # a single post
  _default/list.html      # section & list pages (e.g. /posts/)
  _default/terms.html     # taxonomy index (e.g. /tags/)
  404.html
  partials/               # head, header, footer, meta, post-entry, toc, etc.

assets/
  scss/                   # styles — main.scss imports the _partials
    _variables.scss       # << colors & fonts live here (light + dark)
    _base, _layout, _components, _content
    _sidebar.scss         # optional sidebar + mobile drawer
  js/                     # theme-toggle.js, code-copy.js, sidebar-toggle.js (bundled by js.html)

i18n/*.toml               # UI strings per language (en, zh-cn, zh-tw, ja)
theme.toml                # theme metadata
exampleSite/              # demo content + config for previewing
```

## How things work

- **Theming (dark mode)**: an inline script in `head.html` sets a `.dark` class on
  `<html>` before paint (no flash). `theme-toggle.js` flips it and saves the choice
  in `localStorage` under `pascal-theme`. All colors are CSS variables in
  `_variables.scss`, swapped under `:root.dark`.
- **Styles**: SCSS compiled via Hugo Pipes in `head.html` (minified + fingerprinted
  in production). Requires Hugo **extended**.
- **Scripts**: `partials/js.html` concatenates the JS files into one bundle.
- **Icons**: `partials/svg.html` maps a name to an icon — `{{ partial "svg.html" "github" }}`.
  A curated set (github, x/twitter, email, rss, linkedin, mastodon, bluesky, youtube,
  bilibili, tiktok, instagram, telegram, discord, zhihu, weibo, wechat, globe, link)
  ships as **inline SVG** — zero requests, `currentColor` so it inherits text color.
  Unknown names get a fallback `?` glyph. Opt-in `[params].iconify = true` loads the
  Iconify web component (CDN, pinned + SRI in `js.html`) so any `prefix:name` icon
  (e.g. `simple-icons:bilibili`, `mdi:home`) renders on demand; without a colon it
  stays on the inline set. To add a curated icon, drop an `{{ else if }}` branch in
  `svg.html` (24×24 viewBox, `fill`/`stroke="currentColor"`; grab paths from Simple
  Icons (CC0) or Feather (MIT)).
- **Pagination**: homepage (`index.html`), section lists and taxonomy pages
  (`list.html`) all use `.Paginate` + `partials/pagination.html` (Prev / "n / total"
  / Next). Page size is `[pagination].pagerSize` in the site config (the old
  top-level `paginate` key is deprecated — use the table form). Scales to hundreds
  of posts automatically.
- **Config-driven**: most features are toggled by `[params]` flags in the site
  config (see README). Check `site.Params.*` in partials before adding UI.
- **Sidebar**: `[params.sidebar].enabled` gates it. `baseof.html` wraps `<main>`
  in `.layout` (a CSS grid) and adds `partials/sidebar.html` + a mobile overlay;
  `header.html` has the hamburger; `sidebar-toggle.js` runs the mobile drawer.
  When disabled the layout falls back to the plain 720px centered column.
- **Fonts**: `--font-sans` in `_variables.scss` is the stock system stack plus
  `"Noto Sans"` and the `"Noto Sans CJK SC/TC/JP"` faces, and it **deliberately ends
  on real families — no `sans-serif` generic**. On the owner's Arch box Chrome
  resolves the generic `sans-serif` to a *serif* face (Liberation Serif; Firefox is
  unaffected), so the generic is a trap, not a safety net. Family names must be
  exact: `"Noto Sans CJK"` matches nothing in a browser (only the SC/TC/JP names do),
  even though `fc-match` happily resolves it. Don't re-add the generic, and don't
  restyle fonts without asking the owner.
  Testing note: screenshot with `--headless=new`. Chrome's **old** `--headless` mode
  has broken font prefs and renders everything serif — that artifact once led to a
  bogus "the theme is serif" diagnosis.
- **Footer**: `partials/footer.html` renders one pipe-separated line
  (`© <years> <owner> | <license> | Hosted on <host>`) plus an optional
  "· Powered by Hugo & Pascal" line, all driven by `[params.footer]`
  (`since`, `owner`, `license`, `hostedOn`, `showPoweredBy`). **No social icons
  in the footer** — the owner does not want them there; `.social-icons` is shared
  by `sidebar.html` and `home-profile.html` only.
- **Comments**: `[params.comments]` picks one `provider` (disqus / giscus /
  utterances / waline) and fills that provider's sub-table. `partials/comments.html`
  emits **markup only** — a `#comments-body` div carrying the config as `data-*`
  attributes — and self-gates (missing credentials → nothing renders, so `single.html`
  only checks the per-page `comments: false` override). `comments.js` injects the
  provider script from an `IntersectionObserver` (the repo's only one) when the
  section nears the viewport, so no third-party code loads on unscrolled pages.
  Attribute names must be written out literally per provider: `html/template` can't
  escape a *dynamic* attribute name and silently emits `ZgotmplZ`.
- **Theme change event**: `theme-toggle.js` dispatches `pascal:themechange`
  (`detail.isDark`) on `document` whenever the theme flips — from the button *or*
  a system change. Iframed embeds that can't see our CSS variables listen for it;
  `comments.js` re-themes giscus/utterances via `postMessage` and re-renders Disqus
  via `DISQUS.reset()` (Disqus infers colors from the page background). Waline
  watches `html.dark` itself. Reuse this event for any future embed.

## Conventions

- Guard optional output with `{{ with }}` / `{{ if }}` so missing config never errors.
- New user-facing strings go in `i18n/*.toml` (all languages), referenced with `{{ i18n "key" }}`.
- New colors/spacing go in `_variables.scss` as CSS variables, not hardcoded.
- After changes, always run `hugo --gc` in `exampleSite/` to confirm it builds.

## Status

**Done:** homepage post list, single post (TOC, meta, tags, prev/next, share,
breadcrumbs), light/dark/auto toggle, code copy, class-based syntax highlighting
(`_syntax.scss` — GitHub light / GitHub Dark, Chroma classes), tags/categories,
SEO (OpenGraph, JSON-LD via `partials/json-ld.html`, hreflang alternates), RSS,
404, responsive layout, sidebar (avatar/stats/social/buttons/items/friends,
left-or-right, mobile drawer), multilingual (i18n en/zh-cn/zh-tw/ja + header
language switcher, per-filename content translations), accessibility pass (skip
link, `.visually-hidden` h1 fallbacks, shared `:focus-visible` ring, `%hit-area`
tap targets, i18n'd aria-labels), markdown tables in a scroll container
(`layouts/_default/_markup/render-table.html`), spacing tokens
(`--space-xs`…`--space-xl` in `_variables.scss`), comments (disqus / giscus /
utterances / waline, lazy-loaded + theme-synced — see above; off by default,
example config commented out in `exampleSite/hugo.toml`).

**Not done yet (stubbed):** search (Fuse.js — no UI ships; add a header entry
back when implemented), archives page. Profile-mode homepage is scaffolded but
off by default.

Robots default: pages are indexable; `noindex = true` (site) or `private: true`
(front matter) opts out — the old `enableRobots` flag is gone.

## Design decisions & preferences (owner)

This is a personal, WIP, "vibe-coding" theme (see README notices). Owner preferences
observed while iterating — keep these in mind before restyling:

- **Light and dark must look the same.** Several bugs came from colors that were
  visible in one theme but not the other (e.g. `--color-border` ≈ the dark card).
  When adding lines/borders, verify both modes; prefer `--color-divider` for
  sidebar section rules and `color-mix(... var(--color-primary) ...)` tints for
  hover states (works in both palettes).
- **Sidebar contact buttons are intentionally flat** (no border/fill box) so they
  read identically in light and dark; hover is an accent tint, not a border.
- **Keep motion/animation minimal and calm** (e.g. the lang switcher is one short
  fade, no elaborate transitions).
- **Icons**: prefers inline SVG by default with an *opt-in* CDN path
  (`[params].iconify`), not a heavy always-on icon font. See the Icons note above.
- **README tone**: no emoji; concise; keep the WIP / personal-use / vibe-coding
  notices near the top.
- Repo has CI (`.github/workflows/build.yml` PR build check, `gh-pages.yml` demo
  deploy) and shared Claude settings (`.claude/settings.json`).
