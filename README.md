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
- Prev/next navigation and share buttons
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

## Customizing

- **Colors & fonts**: `assets/scss/_variables.scss` (light + dark palettes).
- **Layout**: copy any file from `themes/pascal/layouts/` into your site's `layouts/` — your copy wins.

## License

MIT — see [LICENSE](LICENSE).
