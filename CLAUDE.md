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
- **Config-driven**: most features are toggled by `[params]` flags in the site
  config (see README). Check `site.Params.*` in partials before adding UI.
- **Sidebar**: `[params.sidebar].enabled` gates it. `baseof.html` wraps `<main>`
  in `.layout` (a CSS grid) and adds `partials/sidebar.html` + a mobile overlay;
  `header.html` has the hamburger; `sidebar-toggle.js` runs the mobile drawer.
  When disabled the layout falls back to the plain 720px centered column.

## Conventions

- Guard optional output with `{{ with }}` / `{{ if }}` so missing config never errors.
- New user-facing strings go in `i18n/*.toml` (all languages), referenced with `{{ i18n "key" }}`.
- New colors/spacing go in `_variables.scss` as CSS variables, not hardcoded.
- After changes, always run `hugo --gc` in `exampleSite/` to confirm it builds.

## Status

**Done:** homepage post list, single post (TOC, meta, tags, prev/next, share,
breadcrumbs), light/dark/auto toggle, code copy, tags/categories, SEO/OpenGraph,
RSS, 404, responsive layout, sidebar (avatar/stats/social/buttons/
items/friends, left-or-right, mobile drawer), multilingual (i18n en/zh-cn/zh-tw/ja
+ header language switcher, per-filename content translations).

**Not done yet (stubbed):** search (Fuse.js), archives page, full comments setup
(giscus is wired but unconfigured), dark-mode syntax-highlight tuning.
Profile-mode homepage is scaffolded but off by default.
