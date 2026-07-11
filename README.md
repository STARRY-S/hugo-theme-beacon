# Pascal

A clean, fast, modern blog theme for [Hugo](https://gohugo.io/) — a two-column card layout with a deep-charcoal palette, crisp typography, subtle motion, and light/dark mode.

![Hugo](https://img.shields.io/badge/Hugo-0.146+-ff4088?logo=hugo) ![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- 🌗 Light / Dark / Auto mode with a toggle (remembers your choice, no flash)
- 📝 Clean post-list homepage with a greeting block
- 📖 Reading time, word count, tags, and breadcrumbs
- 🧭 Table of contents on posts
- 📋 One-click copy button on code blocks
- 🔗 Prev/next post navigation and share buttons
- 🔍 SEO ready: OpenGraph, Twitter cards, RSS, canonical URLs
- 📱 Responsive and mobile-friendly

## Requirements

Hugo **extended** v0.146.0 or newer (needed for SCSS).

```bash
hugo version   # should say "extended"
```

## Install

**Option A — as a Git submodule (recommended):**

```bash
git submodule add https://github.com/starry-s/hugo-theme-pascal themes/pascal
```

**Option B — download** the theme into `themes/pascal/`.

Then set the theme in your site config:

```toml
theme = "pascal"
```

## Quick start

Copy the example site to get going:

```bash
cp -r themes/pascal/exampleSite/* .
hugo server
```

Open http://localhost:1313.

## Configuration

Everything lives under `[params]` in your `hugo.toml`. The most common options:

```toml
[params]
  description = "My blog"
  author = "Your Name"
  dateFormat = "Jan 2, 2006"
  mainSections = ["posts"]      # which folders show on the homepage

  showReadingTime  = true
  showWordCount    = true
  showAuthor       = true
  showToc          = true
  showBreadcrumbs  = true
  showShareButtons = true

  # Greeting block on the homepage
  [params.homeInfo]
    title = "Hi there 👋"
    content = "Welcome to my blog."

  # Social links (footer). icon = github | twitter | rss | email | linkedin | mastodon | bluesky | youtube
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

Show an avatar, bio, stats, links, and a friends list beside your content.
It's **off by default** — enable it and it appears on every page (sticky on
desktop, a slide-in drawer on mobile).

```toml
[params.sidebar]
  enabled     = true
  position    = "left"        # "left" or "right"
  avatar      = "/images/avatar.svg"
  author      = "Your Name"
  description = "A short line about you."
  showStats   = true          # post / category / tag counts
  itemsTitle  = "Elsewhere"

  [[params.sidebar.buttons]]   # pill buttons (icon optional)
    name = "Follow me"
    icon = "github"
    url  = "https://github.com/you"

  [[params.sidebar.items]]     # custom link list
    name = "Portfolio"
    url  = "/about/"

  [[params.sidebar.friends]]   # friends / blogroll
    name = "Hugo"
    url  = "https://gohugo.io/"
```

Social icons in the sidebar reuse your `[[params.social]]` config.

### Profile-mode homepage (optional)

Show an avatar and bio instead of the post list:

```toml
[params.profileMode]
  enabled  = true
  title    = "Your Name"
  subtitle = "A short line about you."
  imageUrl = "/images/avatar.png"
```

### Multilingual (optional)

The theme is fully translatable. UI strings live in `i18n/<lang>.toml` — bundled
translations ship for **English (`en`), Simplified Chinese (`zh-cn`), Traditional
Chinese (`zh-tw`), and Japanese (`ja`)**. Add more by dropping in another `i18n/<lang>.toml`.

Configure the languages in your site config; each can override the title, description,
menu, and sidebar strings:

```toml
defaultContentLanguage = "en"   # English at "/", others under /zh-cn/, /ja/, …
hasCJKLanguage = true           # correct word/character counts for CJK

[languages]
  [languages.en]
    label = "English"
    locale = "en-US"
    weight = 1
  [languages.zh-cn]
    label = "简体中文"
    locale = "zh-CN"
    weight = 2
    [languages.zh-cn.params]
      description = "…"
      [languages.zh-cn.params.sidebar]
        author = "张三"
        description = "…"
    [languages.zh-cn.menu]
      [[languages.zh-cn.menu.main]]
        name = "文章"
        pageRef = "/posts"
```

Translate content by adding a language suffix to the filename — `about.md` →
`about.zh-cn.md`, `posts/hello.md` → `posts/hello.ja.md`. When more than one language
is configured, a **language switcher** automatically appears in the header; it links
straight to the translated page when one exists, otherwise to that language's home.
See `exampleSite/` for a complete four-language setup.

## Writing a post

Put Markdown files in `content/posts/`:

```markdown
---
title: "My First Post"
date: 2026-07-10
tags: ["hugo", "blog"]
description: "A short summary for SEO and previews."
cover:
  image: "/images/cover.png"   # optional
---

Your content here.
```

Per-post overrides you can set in front matter: `showToc`, `showBreadcrumbs`, `draft`.

## Customizing

- **Colors & fonts**: edit `assets/scss/_variables.scss` (light and dark palettes).
- **Layout tweaks**: override any file by copying it from `themes/pascal/layouts/`
  into your own site's `layouts/` folder — your copy wins.

## License

MIT — see [LICENSE](LICENSE).
