# CLAUDE.md

Notes for working on the **Beacon** Hugo theme.

## What this is

A clean, modern blog theme for Hugo: a two-column card layout with a deep-charcoal
palette, crisp typography, and subtle motion. Fast, responsive, light/dark mode.
The design is our own — it does not follow any other Hugo theme.
This repo is the **theme itself**, not a site. The `exampleSite/` folder is used
to preview and test it.

## How to preview

```bash
cd exampleSite
hugo server --disableFastRender -p 1314   # http://localhost:1314
```

**Port note:** the owner may be running their own dev server on the default
`localhost:1313`. When Claude starts a server (hugo or otherwise), use another
port such as 1414 or 1314 (`hugo server -p 1314`).

The example site finds the theme via a symlink: `exampleSite/themes/beacon -> ../..`.
If it's missing, recreate it:

```bash
cd exampleSite && mkdir -p themes && ln -sfn ../.. themes/beacon
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
  _default/section.html   # section pages (e.g. /posts/) — year timeline
  _default/list.html      # taxonomy term pages (e.g. /tags/hugo/) — cards
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
  in `localStorage` under `beacon-theme`. All colors are CSS variables in
  `_variables.scss`, swapped under `:root.dark`.
- **Styles**: SCSS compiled via Hugo Pipes in `head.html` (minified + fingerprinted
  in production). Requires Hugo **extended** *and* **Dart Sass**, which Hugo does not
  embed — install it (`sudo snap install dart-sass`) or every build dies with
  "You need to install Dart Sass". CI installs it in both workflows.
  `head.html` pins `"transpiler" "dartsass"`: libsass is deprecated (Hugo v0.153.0),
  and it never supported the module system. `main.scss` therefore uses **`@use`, not
  `@import`** — `@import` is deprecated in Dart Sass and is removed in 3.0, and it
  warned once per import. The two go together: you cannot use `@use` on libsass, so
  don't "fix" one without the other. All five placeholders (`%card`, `%btn`,
  `%avatar`, `%hit-area`, `%section-label`) live in `_base.scss`, so every file that
  `@extend`s one (`_layout`, `_components`, `_content`, `_sidebar`) declares its own
  `@use "base";` at the top — module members are per-file, not global. `@extend` does
  reach across module boundaries; the only effect of the migration on output was the
  order of selectors *within* extend groups (cosmetic — same cascade).
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
- **Pagination**: the homepage (`index.html`) and taxonomy term pages
  (`list.html`) use `.Paginate` + `partials/pagination.html` (Prev / "n / total"
  / Next). Page size is `[pagination].pagerSize` in the site config (the old
  top-level `paginate` key is deprecated — use the table form). Scales to hundreds
  of posts automatically. Section lists are **not** paginated — see Timeline.
- **Timeline (section lists)**: `/posts/` and any other section render via
  `_default/section.html` as a title-only archive grouped by year
  (`.Pages.GroupByPublishDate "2006"`), styled by `_timeline.scss` — a single
  vertical rail with an accent dot per year. Classes are `.post-timeline*`: a bare
  `.timeline` collides with the gallery's photo groups, which own that name. Deliberately **unpaginated**: an
  archive only reads as a timeline when every year is on one page, and title rows
  are cheap. The card view lives on the homepage; taxonomy term pages keep cards
  by falling through to `list.html` (Hugo picks `section.html` for `Kind=section`
  before `list.html`, so the split needs no branching). Dates use `PublishDate`
  (matching `post-meta.html`) formatted with `[params].timelineDateFormat`,
  default `01-02` — numeric and language-neutral, since the year is already the
  heading and month names would not fit the CJK translations.
- **Gallery**: `layouts/gallery/single.html` picks one of three layouts for a
  `type = "gallery"` bundle: a `[[timeline]]` **slice** in front matter → hand-written
  groups (`gallery-timeline.html`); `timeline = false` → plain waterfall
  (`gallery.html`); **otherwise → auto-group by date** (`gallery-auto-timeline.html`),
  which is the default. Auto grouping is by day, days newest-first but photos within
  a day oldest-first. Dates come from `gallery-date.html`: EXIF `DateTimeOriginal`
  (via `.Meta.Date`) first, else a `YYYYMMDD-HHMMSS` filename stamp — that fallback
  exists because such names usually come from a file's **mtime**, which can be days
  (or a year) off the capture date, so EXIF must always win. Undatable photos go to a
  final "undated" group, never dropped. **This needs `[imaging.exif]` in the site
  config** — Hugo strips EXIF otherwise and every photo falls through. Captions:
  front matter `[[resources]]` params first, else a **sidecar JSON** read by
  `gallery-meta.html` (`photo.jpg.meta` or `photo.meta` — both conventions exist in
  the wild; `{ "Title": …, "Rating": … }`, only Title used). Hugo has no media type
  for `.meta`, so the resource is typeless: read `.Content` and unmarshal the
  *string*, which Hugo sniffs as JSON — `transform.Unmarshal` on the resource fails.
  Both sidecar reads are wrapped in `try`; a bad file must not kill the build.
  Note `.timeline`/`.timeline__*` (photo groups, `_gallery.scss`) is a different
  component from `.post-timeline` (post archive, `_timeline.scss`) — don't merge them.
- **Extend hooks**: `partials/extend_head.html` (called last in `head.html`) and
  `partials/extend_footer.html` (called from `baseof.html` after the JS bundle) are
  **empty stubs** the theme ships so a site can drop in its own copy — Hugo's lookup
  order makes the site's file win, and the stub has to exist because Hugo errors on a
  missing partial. Same idea as PaperMod's hooks. Never put theme output in them, and
  keep `extend_footer` on plain `partial` (not `partialCached`) — an override may vary
  per page. This is the supported way to add analytics/custom tags; it's what keeps
  people from forking `baseof.html`.
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
- **Footer**: `partials/footer.html` renders one dot-separated line
  (`© <years> <owner> · <license> · Hosted on <host>`) under a short centered
  rule, plus an optional smaller "Powered by Hugo & Beacon" line, all driven
  by `[params.footer]`. Footer links stay the muted text color (faint
  underline, accent on hover) — they're metadata, not calls to action.
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
- **Math (LaTeX)**: opt-in by enabling Goldmark's passthrough extension in the
  *site* config (see README "Math"); the theme ships
  `layouts/_default/_markup/render-passthrough.html`, which typesets with KaTeX
  **at build time** via `transform.ToMath` — no client JS. The hook sets
  `.Page.Store "hasMath"`, and `head.html` links the KaTeX CSS (CDN, pinned +
  SRI, like iconify) only on pages with math; the `$noop := .WordCount` line
  there is load-bearing — it forces content render before the store check.
  `$…$` single-dollar inline is deliberately not in the recommended delimiters
  (collides with prices). `.katex-display` gets `overflow-x: auto` in
  `_content.scss` so wide equations scroll like tables.
  There are also `{{< mathjax/inline >}}…{{< /mathjax/inline >}}` and
  `{{< mathjax/block >}}…{{< /mathjax/block >}}` **shortcodes**
  (`layouts/shortcodes/mathjax/`) for authors who prefer the shortcode syntax
  (or are porting content that used the client-side MathJax shortcode of the
  same name). Despite the name they typeset with the same **build-time KaTeX**
  (`transform.ToMath`) as the render hook — no MathJax, no client JS — and set
  the same `hasMath` store flag. They tolerate the expression with or without
  `\( \)` / `$$` / `\[ \]` delimiters (stripped before `ToMath`). No site config
  beyond the passthrough extension is needed for the shortcodes, but enabling
  passthrough is still recommended so bare delimiters work too.
- **Music**: `{{< music >}}` (`layouts/shortcodes/music.html`) embeds an APLayer +
  MetingJS player — positional `{{< music netease song 594295 >}}` (server type id),
  named params (`server`/`type`/`id`, or `url`/`name`/`artist`/`cover` for a local
  file, or `auto=<share url>`), plus the usual APLayer options. `url`/`cover` accept
  a page-bundle resource path or absolute URL. The player library (APLayer + Meting
  CSS/JS, CDN) loads **only on pages that use the shortcode** — `head.html` gates it
  with `.HasShortcode "music"`, like the KaTeX CSS. The meting API endpoint defaults
  to injahow's public instance; override with `[params.meting].api`. Player accent
  defaults to the theme blue (`theme=` overrides). NOTE: this pulls in a third-party
  CDN + API — heavier than the rest of the theme; it's opt-in per page by design.
  APlayer is **not theme-aware**: it hardcodes `background: #fff` and explicit icon
  `fill`s (no `currentColor`), but leaves the text color on `.aplayer-title` and the
  `.aplayer-list` rows to inherit — under `:root.dark` those inherited our light body
  color and went invisible on its white. `_music.scss` pins `.aplayer { color }` to a
  fixed dark value (one declaration; both leaks inherit from `.aplayer`). It is
  deliberately *not* a theme variable and *not* scoped to `.dark` — the player keeps
  its own light skin in both modes, which is also what the light palette already fed
  it, so light is unchanged. Don't try to re-skin the player dark; it's a third-party
  island, not our chrome.
- **Sponsor**: a **global**, config-driven collapsible "buy me a coffee" block at the
  bottom of single pages (`partials/sponsor.html`, rendered from `single.html` after
  the post footer). Not a shortcode — configured once in `[params.sponsor]`:
  `enabled` (global on/off), optional `text` (button label; defaults to i18n key
  `sponsor`), and `[[params.sponsor.items]]` cards (`title`, `badge`/`subtitle`,
  `address`, `qr`, `qrtext`). Self-gating like `comments.html` (no config / no items →
  nothing renders); per-page front matter `sponsor = false` hides it, default is
  shown. The QR per item resolves in order: `qr` image (an `assets/` resource or a
  `static/`/URL path) → `qrtext` → `address`; when it falls through to text the QR is
  generated **at build time** with Hugo's `images.QR` (tiny 1-bit PNG, no client-side
  QR library, no external request — same build-time spirit as the math), so a crypto
  wallet needs only `address` and both QR and the click-to-copy line come for free.
  Optional per-item `color` recolors the QR modules: `images.QR` only emits
  black-on-white, so `.sponsor-qr-wrap::after` paints a solid `--qr-color` overlay in
  `mix-blend-mode: screen` (white bg stays white, black modules become the color;
  broadly supported, no-op when unset). The custom property is passed via an inline
  `style` with `safeCSS` — without it html/template sanitizes the `--…` property to
  `ZgotmplZ`. Keep colors reasonably dark: very light shades (bright yellow/orange)
  cut module/background contrast and hurt scanning.
  Styling is `_sponsor.scss` (Beacon variables + shadow/spacing tokens, light/dark in
  step); behaviour is `sponsor.js` (event-delegated toggle + copy in the JS bundle,
  no inline handlers; reuses the body `data-copied` label). Demo config in
  `exampleSite/hugo.toml`; the block shows at the bottom of every post.
- **Theme change event**: `theme-toggle.js` dispatches `beacon:themechange`
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
example config commented out in `exampleSite/hugo.toml`), LaTeX math
(build-time KaTeX via passthrough render hook + `mathjax/inline` & `mathjax/block`
shortcodes — see above), shortcodes: gallery, music (APLayer/MetingJS, lazy CDN),
global sponsor / buy-me-a-coffee block (config-driven, collapsible QR cards with
click-to-copy, build-time QR — see above).

**Not done yet (stubbed):** search (Fuse.js — no UI ships; add a header entry
back when implemented). Profile-mode homepage is scaffolded but off by default.
(The archives page is effectively covered by the section timeline — see above.)

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
