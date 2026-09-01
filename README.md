# Beacon

A clean, fast blog theme for [Hugo](https://gohugo.io/) with an editorial layout, responsive images, multilingual navigation, and an Auto / Light / Dark color scheme.

![Hugo](https://img.shields.io/badge/Hugo-0.155.3+-ff4088?logo=hugo) ![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- Auto → Light → Dark theme control with system-theme tracking and persistence
- Editorial post lists, nested section archives, taxonomies, breadcrumbs, TOC, code copy, and share links
- Responsive local images with orientation correction, WebP candidates, intrinsic dimensions, and safe fallbacks
- Gallery waterfall/timeline layouts with captions, EXIF details, and an accessible lightbox
- Optional accessible sidebar, Sponsor cards, comments, build-time math, music, and Profile homepage
- Multilingual UI: English, Simplified Chinese, Traditional Chinese, and Japanese
- Pagination-aware canonical/OpenGraph metadata, JSON-LD, hreflang, RSS, robots, and sitemap output

## Requirements

- Hugo **extended** 0.155.3 or newer
- Dart Sass 1.102.0 (the theme uses Hugo's external Dart Sass transpiler and SCSS modules)
- Node.js 24 only when contributing or running the repository test suite

Install Dart Sass with a version-aware package manager. For example:

```bash
npm install --global sass-embedded@1.102.0
```

Verify both tools before building:

```bash
hugo version
sass --version
```

## Install and start safely

Add the theme, then copy the deliberately minimal starter configuration. Do not copy `exampleSite/`: it is a feature demo and intentionally contains third-party integrations and placeholder payment data.

```bash
hugo new site my-blog
cd my-blog
git init
git submodule add https://github.com/starry-s/hugo-theme-beacon themes/beacon
cp themes/beacon/hugo.example.toml hugo.toml
hugo new content posts/hello.md
hugo server -D
```

The starter has no comments, music, Iconify, Sponsor provider, or real external account configured.

## Core configuration

```toml
[params]
  description = "My blog"
  author = "Your Name"
  mainSections = ["posts"]
  dateFormat = ":date_long"       # Hugo-localized; any Go time layout also works
  postDateFormat = ":date_long"   # optional post-only override; falls back to dateFormat
  timelineDateFormat = "01-02"

  showReadingTime = true
  showWordCount = true
  showAuthor = true
  showDate = true
  showLastmod = false
  showSummary = true
  showToc = true
  showBreadcrumbs = true
  showShareButtons = true
```

All `show…` values may be overridden in page front matter. An explicit `false` always wins over the site default. When `showLastmod` is enabled, single pages display a localized “Last updated” line only when `.Lastmod` is later than `.PublishDate`; list entries remain compact. Use a numeric-zone layout such as `2006-01-02 15:04:05 UTCZ07:00` when an unambiguous timestamp is preferred. Set `pinned = true` to render a localized list badge; use Hugo's `weight` independently when the page should sort first.

### URLs and links

Use `pageRef` for links to content. It resolves against the current language and survives taxonomy, permalink, base URL, and subpath changes:

```toml
[[menus.main]]
  name = "Posts"
  pageRef = "/posts"
  weight = 10

[[params.social]]
  name = "About"
  icon = "link"
  pageRef = "/about"
```

Configuration fields for static files, such as `logo`, `favicon`, `avatar`, and image covers, accept either `images/logo.svg` or `/images/logo.svg`; both remain under a base URL such as `https://example.com/blog/`. Fully qualified URLs, protocol-relative URLs, `mailto:`, `tel:`, and fragments remain unchanged.

For external links, Beacon adds the appropriate new-window isolation attributes where it controls the markup. Hugo menu entries may set `params.rel` explicitly when needed.

### Indexing

Pages are indexable by default. Set `noindex = true` in site params or page front matter to emit `noindex, follow` and exclude the page from the sitemap:

```yaml
---
title: Draft notes
noindex: true
---
```

The legacy page parameter `private: true` remains an alias for compatibility but is deprecated. Neither setting restricts access: published HTML is still public. Use server-side authentication or do not publish sensitive content.

## Optional features

### Sidebar and Profile homepage

```toml
[params.sidebar]
  enabled = true
  position = "left"
  showOnSingle = true
  collapsibleOnSingle = false
  showOnMobile = true
  avatar = "images/avatar.svg"
  avatarSize = 128
  author = "Your Name"
  description = "A short biography."
  showStats = true
  showTopTags = true
  topTagsLimit = 8
  buttonsLayout = "grid" # optional; the default is a vertical list

  [[params.sidebar.items]]
    name = "About"
    pageRef = "/about"

[params.profileMode]
  enabled = false
```

`showOnSingle` and `showOnMobile` default to `true` for compatibility. Set `showOnSingle = false` and `collapsibleOnSingle = true` to keep main-section articles centered while offering the same sidebar from a desktop panel button; `showOnMobile` independently controls whether that drawer is available below `1100px`. A page-level `showSidebar: true` or `showSidebar: false` overrides the permanent page-kind layout, while `showSidebarDrawer: true` or `showSidebarDrawer: false` overrides the optional drawer. A permanent sidebar takes precedence when both are requested. Drawers trap focus, close with Escape or the backdrop, and restore focus to their opener. `avatarSize` sets the square avatar size in pixels and defaults to `128`. `buttonsLayout = "grid"` arranges sidebar buttons in two columns; the default remains a vertical list. `showTopTags` is opt-in and lists the most-used tags for the current language; `topTagsLimit` defaults to `8`, while `topTagsTitle` optionally overrides the localized heading. Non-square avatars can still be customized with a layout override.

### Comments

Comments are disabled unless explicitly configured. The selected provider is fetched only when a reader approaches the comments section.

```toml
[params.comments]
  enabled = true
  provider = "giscus" # giscus | utterances | disqus | waline

  [params.comments.giscus]
    repo = "user/repo"
    repoId = "R_xxxxxxxxxx"
    category = "Announcements"
    categoryId = "DIC_xxxxxxxxxx"
```

Provider scripts send the page URL and browser/network metadata to their operators and may set cookies. Review the provider's privacy terms before enabling it. Set `comments: false` on a page to disable comments there.

### Sponsor

Sponsor is global configuration, not a shortcode. It renders native `<details>` cards and build-time QR images:

```toml
[params.sponsor]
  enabled = true

  [[params.sponsor.items]]
    title = "Support this site"
    address = "replace-with-a-real-value"
    badge = "COPY"
```

Use `qr = "images/payment.png"`, `qrtext`, or `address` as the QR source. Set `sponsor: false` per page to hide the block. Never publish secret keys or credentials; addresses in `exampleSite/` are visibly fake demonstration values.

### Music

The shortcode supports provider metadata or a direct audio URL:

```md
{{</* music server="netease" type="song" id="594295" */>}}
{{</* music url="song.mp3" name="Song" artist="Artist" cover="cover.jpg" */>}}
```

It loads APlayer 1.10.1 and MetingJS 2.0.2 from jsDelivr only on pages containing the shortcode. Provider-based playback also contacts a Meting API. The public default is not an availability or privacy guarantee; run your own endpoint and configure it when reliability matters:

```toml
[params.meting]
  api = "https://music-api.example.com/?server=:server&type=:type&id=:id&auth=:auth&r=:r"
```

### Iconify

The built-in icon set is inline and makes no network request. Setting `params.iconify = true` loads the pinned Iconify web component from its CDN so names such as `simple-icons:telegram` can be used. Keep it disabled if the extra third-party request is undesirable.

### Math

Enable Goldmark passthrough to render KaTeX at build time:

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]
```

The KaTeX stylesheet is fetched only on pages that use math. Single-dollar delimiters are intentionally omitted because they conflict with currency text.

## Images and galleries

Markdown images use their alt text correctly; a title becomes a caption. Append `#noZoom` to the title to disable the lightbox for one image:

```md
![A useful description](diagram.png "Diagram caption")
![Decorative texture](texture.png "#noZoom")
```

Beacon keeps display images separate from lightbox images. Local Markdown images up to 2560 pixels wide are published unchanged, so an already-optimized JPEG is not decoded and encoded again. Larger images receive responsive WebP display candidates up to 2560 pixels, while clicking the image opens the original by default. Covers remain responsive display assets, and gallery thumbnails default to 1200 pixels; neither path upscales a source image.

These defaults can be adjusted without changing the theme:

```toml
[params.imageProcessing]
  quality = 82                 # encoder quality, not a literal compression percentage
  contentMaxWidth = 2560       # preserve smaller Markdown images; cap display candidates above it
  galleryThumbnailWidth = 1200 # overridden by the gallery shortcode's thumb argument
  lightboxMaxWidth = 0         # 0 keeps the original; set a width to cap unusually large originals
```

Hugo writes derivatives only to its generated output and resource cache; it never modifies source images. External, static-only, GIF, SVG, and unsupported images fall back safely and still open their original URL. For responsive processing and complete intrinsic dimensions, keep article images in a page bundle or the site's `assets/` directory.

Create a gallery as a leaf bundle:

```text
content/gallery/
  index.md       # front matter: type = "gallery"
  images/
    beach.jpg
    city.jpg
```

The default timeline groups photos by EXIF capture day, then by a `YYYYMMDD-HHMMSS` filename fallback. Set `timeline = false` for a plain waterfall, or define `[[timeline]]` groups in front matter. Inline galleries use:

```md
{{</* gallery */>}}
{{</* gallery match="trip/*" thumb="600" reverse="true" */>}}
```

`thumb` overrides `galleryThumbnailWidth` for that gallery and must be between 200 and 2400 pixels. Invalid arguments report the source page and position.

Hugo 0.155.3 introduced the image resource `.Meta` API used by the gallery. Preserve EXIF while explicitly excluding GPS:

```toml
[imaging.meta]
  sources = ["exif"]
  fields = ["**", "! *GPS*"]
```

Caption and alt text may be supplied through page resource params. Sidecar `photo.jpg.meta` or `photo.meta` JSON may contain a `Title`; malformed sidecars are ignored without breaking the build.

## Multilingual sites

Bundled UI translations use `en`, `zh-cn`, `zh-tw`, and `ja`. Configure a locale for localized dates and metadata:

```toml
defaultContentLanguage = "en"
hasCJKLanguage = true

[languages.en]
  locale = "en-US"
  weight = 1
  [languages.en.params]
    languageLabel = "English"

[languages.zh-cn]
  locale = "zh-CN"
  weight = 2
  [languages.zh-cn.params]
    languageLabel = "简体中文"
```

Translate content with filename suffixes such as `about.zh-cn.md`. Prefer `pageRef` over literal translated paths.
For an RTL language, set `direction = "rtl"` inside that language's `[languages.<code>.params]` table.

## Extension hooks and customization

Override these empty partials in your site without copying the HTML shell:

| Site file | Position |
| --- | --- |
| `layouts/partials/extend_head.html` | End of `<head>` |
| `layouts/partials/extend_footer.html` | End of `<body>`, after theme JavaScript |

Colors and fonts are CSS variables in `assets/scss/_variables.scss`. Copy only the partial or layout you need into the site; site files take precedence over theme files.

## Contributing and tests

See [CONTRIBUTING.md](CONTRIBUTING.md) for the locked Node 24 workflow and [docs/architecture.md](docs/architecture.md) for the small set of design constraints that maintainers need to preserve.

## License

MIT — see [LICENSE](LICENSE).
