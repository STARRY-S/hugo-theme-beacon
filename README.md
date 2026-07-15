# Pascal

A clean, fast blog theme for [Hugo](https://gohugo.io/) — two-column card layout, deep-charcoal palette, light/dark mode.

![Hugo](https://img.shields.io/badge/Hugo-0.146+-ff4088?logo=hugo) ![License](https://img.shields.io/badge/License-MIT-blue)

> **Status: Work in progress.** Under active development — expect large refactors and breaking changes.
>
> **Mainly for my personal use.** This is a vibe-coding project, built for my own blog. You're welcome to try it, but there are no stability or support guarantees.

## Features

- Light / Dark / Auto theme toggle (remembers choice, no flash)
- Post-list homepage, reading time, word count, tags, breadcrumbs
- Table of contents and one-click code copy
- Click-to-zoom image preview (lightbox) with captions and keyboard navigation
- Gallery — a masonry photo waterfall or a dated timeline (Photos-style), plus an inline shortcode; thumbnails auto-generated
- Prev/next navigation and share buttons
- LaTeX math, typeset at build time with KaTeX — no client-side JavaScript
- SEO ready: OpenGraph, Twitter cards, JSON-LD, hreflang alternates, RSS, canonical URLs
- Responsive, with an optional sidebar and multilingual UI

## Requirements

Hugo **extended** v0.146.0 or newer (for SCSS). Check with `hugo version`.

## Install

Add as a submodule (or download into `themes/pascal/`), then set the theme:

```bash
git submodule add https://github.com/starry-s/hugo-theme-pascal themes/pascal
```

```toml
theme = "pascal"
```

## Quick start

```bash
cp -r themes/pascal/exampleSite/* .
hugo server   # http://localhost:1313
```

## Configuration

Options live under `[params]` in `hugo.toml`:

```toml
[params]
  description = "My blog"
  author = "Your Name"
  mainSections = ["posts"]      # folders shown on the homepage

  showReadingTime  = true
  showWordCount    = true
  showToc          = true
  showBreadcrumbs  = true
  showShareButtons = true

  # Pages are indexable by default. Set noindex = true to ask search
  # engines to skip the whole site (per-page: `private: true` front matter).
  noindex = false

  # Optional: load the Iconify CDN so any "prefix:name" icon works.
  iconify = false

  [params.homeInfo]             # homepage greeting block
    title = "Hi there"
    content = "Welcome to my blog."

  # Social links. icon = a built-in name (github, x, rss, email, linkedin,
  # youtube, bilibili, tiktok, instagram, telegram, discord, zhihu, weibo,
  # wechat, globe, link) or any Iconify "prefix:name" when iconify = true.
  [[params.social]]
    name = "GitHub"
    icon = "github"
    url  = "https://github.com/you"
```

### Menu

```toml
[[menu.main]]
  name = "Posts"
  url  = "/posts/"
  weight = 1
```

### Sidebar (optional)

Avatar, bio, stats, links, and a friends list beside your content. Off by default; sticky on desktop, a drawer on mobile.

```toml
[params.sidebar]
  enabled     = true
  position    = "left"        # "left" or "right"
  avatar      = "/images/avatar.svg"
  author      = "Your Name"
  description = "A short line about you."
  showStats   = true
  itemsTitle  = "Elsewhere"

  [[params.sidebar.buttons]]  # contact buttons (icon optional)
    name = "Follow me"
    icon = "github"
    url  = "https://github.com/you"

  [[params.sidebar.items]]    # custom link list
    name = "Portfolio"
    url  = "/about/"

  [[params.sidebar.friends]]  # blogroll
    name = "Hugo"
    url  = "https://gohugo.io/"
```

Sidebar social icons reuse your `[[params.social]]` config.

### Footer (optional)

Renders `© 2016 - 2026 Owner | License | Hosted on Host`, then `· Powered by Hugo & Pascal`. Every part is optional — with no `[params.footer]` you get `© <this year> <site title>` plus the Powered-by line. The footer carries no social icons; those belong to the sidebar and profile-mode homepage.

```toml
[params.footer]
  since = 2016                # start year; omit for the current year alone
  owner = "Your Name"         # defaults to the site title
  showPoweredBy = true        # set false to drop the second line

  [params.footer.license]
    name = "CC BY-NC-SA 4.0"
    url  = "https://creativecommons.org/licenses/by-nc-sa/4.0/"

  [params.footer.hostedOn]
    name = "GitHub Pages"
    url  = "https://pages.github.com/"
```

`url` is optional in both blocks — leave it out and the name renders as plain text. If `since` equals the current year, only that year is shown.

### Comments (optional)

Off by default. Choose one provider and fill in its table. The widget is only fetched once a reader scrolls near the bottom of a post, and it follows the light/dark toggle.

```toml
[params.comments]
  enabled  = true
  provider = "disqus"          # disqus | giscus | utterances | waline

  [params.comments.disqus]
    shortname = "your-disqus-shortname"

  [params.comments.giscus]
    repo       = "user/repo"
    repoId     = "R_xxxxxxxxxx"
    category   = "Announcements"
    categoryId = "DIC_xxxxxxxxxx"
    mapping    = "pathname"     # optional
    inputPosition = "bottom"    # optional

  [params.comments.utterances]
    repo      = "user/repo"
    issueTerm = "pathname"      # optional
    label     = "comment"       # optional

  [params.comments.waline]
    serverURL = "https://your-waline.vercel.app"
```

| Provider | Backed by | Setup |
| --- | --- | --- |
| `giscus` | GitHub Discussions | Public repo with Discussions on; get the IDs from [giscus.app](https://giscus.app) |
| `utterances` | GitHub Issues | Public repo with the [utterances app](https://github.com/apps/utterances) installed |
| `disqus` | Disqus (hosted) | Register a site at [disqus.com](https://disqus.com); use its shortname |
| `waline` | Your own server | Self-host [Waline](https://waline.js.org) (Vercel + a database); readers need no account |

Only providers with valid credentials render — a half-filled table produces no comments section.

Disable comments on one post with `comments: false` in its front matter. For Disqus, `disqus_identifier: "some-id"` pins a thread to a post whose URL has changed.

Notes: Disqus is the heaviest option and loads third-party trackers. giscus and utterances re-theme instantly when the reader flips the theme; Disqus reloads its thread, since it infers colors from the page background.

If you used the earlier giscus stub, move its settings from the top-level `[params.giscus]` into `[params.comments.giscus]` and replace `comments = true` with the `[params.comments]` table above.

### Multilingual (optional)

Fully translatable. Bundled UI strings: English (`en`), Simplified Chinese (`zh-cn`), Traditional Chinese (`zh-tw`), Japanese (`ja`). Add more via `i18n/<lang>.toml`.

```toml
defaultContentLanguage = "en"
hasCJKLanguage = true

[languages]
  [languages.en]
    label = "English"
    weight = 1
  [languages.zh-cn]
    label = "简体中文"
    weight = 2
```

Translate content with a filename suffix — `about.md` → `about.zh-cn.md`. A language switcher appears in the header automatically. See `exampleSite/` for a full setup.

### Math / LaTeX (optional)

Equations are typeset **at build time** with KaTeX (Hugo's `transform.ToMath`),
so readers download no JavaScript — only the KaTeX stylesheet, and only on
pages that actually contain math. Enable Goldmark's passthrough extension in
your site config:

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]
```

Then write `\(e^{i\pi} + 1 = 0\)` inline or `$$ … $$` for display equations.
Single-dollar inline delimiters (`$…$`) are deliberately left out of the
recommended setup — they collide with ordinary prose like "$5 and $10".

## Writing a post

```markdown
---
title: "My First Post"
date: 2026-07-10
tags: ["hugo", "blog"]
description: "A short summary for SEO."
---

Your content here.
```

Per-post front matter overrides: `showToc`, `showBreadcrumbs`, `draft`, `private` (excludes the page from search engines).

**Images** use plain Markdown — `![alt](/path.png "optional caption")`. The quoted
title becomes a caption and the image opens in a full-screen preview on click.
End the title with `#noZoom` to keep a specific image from zooming.

## Gallery / photo waterfall

Two ways to lay out photos as a masonry grid with click-to-zoom. Both generate
resized thumbnails and a size-capped full image with Hugo's image processing —
no external service, all cached and fingerprinted. Put the photos in a
[page bundle](https://gohugo.io/content-management/page-bundles/) so Hugo can
find them as resources.

**A whole gallery page** — make a leaf bundle and set `type = "gallery"`:

```
content/gallery/
  index.md        # front matter: type = "gallery"
  seaside.jpg
  alley.jpg
```

Every image in the bundle is laid out automatically; any Markdown in `index.md`
renders as an intro above the grid. Set `galleryReverse = true` to flip the
order.

**Timeline mode** (Apple/Google Photos style) — group the photos into dated
sections down a timeline rail. Add a `timeline` array to the page front matter;
sections render newest-first automatically:

```toml
[[timeline]]
  date = "2026-03-20"                       # ISO date — sorts + labels the section
  title = "City nights"
  description = "A weekend downtown after dark."
  images = ["city-night.jpg", "coffee.jpg"] # explicit, ordered
[[timeline]]
  date = "2026-01-10"
  title = "First snow"
  match = "snow*.jpg"                        # …or select with a glob
```

Drop the `timeline` block and the same page falls back to a plain waterfall of
every image.

**An inline gallery** — inside any post that is a bundle, use the shortcode:

```md
{{</* gallery */>}}                     all images in the post's bundle
{{</* gallery match="trip/*" */>}}      only those matching a glob
{{</* gallery reverse="true" thumb="600" */>}}
```

**Captions** (optional) come from each image's resource params. Add them to the
page front matter:

```toml
[[resources]]
  src = "seaside.jpg"
  [resources.params]
    caption = "Low tide, early light"   # shows on hover + in the lightbox
    alt = "A rocky beach at dawn"        # alt text (defaults to the caption)
```

**EXIF details** — the lightbox shows each photo's camera, lens, exposure
(focal length · aperture · shutter · ISO) and capture date, read straight from
the file. Hugo strips EXIF by default, so opt the fields back in once in your
site config:

```toml
[imaging.exif]
  includeFields = "Make|Model|LensModel|FNumber|ExposureTime|ISOSpeedRatings|ISO|FocalLength|DateTimeOriginal"
  disableLatLong = true   # keep GPS location out
```

Photos without EXIF (or with it stripped) simply show no details — nothing
breaks.

## Customizing

- **Colors & fonts**: `assets/scss/_variables.scss` (light + dark palettes).
- **Layout**: copy any file from `themes/pascal/layouts/` into your site's `layouts/` — your copy wins.

## License

MIT — see [LICENSE](LICENSE).
