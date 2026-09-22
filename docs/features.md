# Feature guides

Beacon keeps network-dependent features optional. The starter configuration enables none of them.

## Images and lightbox

Markdown images receive lazy loading, intrinsic dimensions when available, and a keyboard-accessible lightbox. A Markdown title becomes a caption:

```md
![A useful description](diagram.png "Diagram caption")
![Decorative texture](texture.png "#noZoom")
```

Standalone captions require Goldmark to leave images placed on their own line
outside paragraph elements. This is already set in Beacon's starter and example
configuration. Add it when upgrading an existing site:

```toml
[markup.goldmark.parser]
  wrapStandAloneImageWithinParagraph = false
```

Images next to other text remain inline and do not display a caption.

Append `#noZoom` to the title to disable the lightbox for one image.

Local Markdown images up to 2560 pixels wide are published unchanged, avoiding a second lossy encode. Larger images receive responsive WebP display candidates up to 2560 pixels, while the lightbox opens the original by default. Covers remain responsive display assets.

```toml
[params.imageProcessing]
  quality = 82
  contentMaxWidth = 2560
  galleryThumbnailWidth = 1200
  lightboxMaxWidth = 0
```

`quality` is encoder quality, not a literal compression percentage. `lightboxMaxWidth = 0` preserves the original; set a nonzero width only when unusually large source files need a cap. Hugo writes derivatives to generated output and caches, never over the source files.

For responsive processing, keep images inside a page bundle or under `assets/`. Remote, static-only, GIF, SVG, and unsupported images fall back to their original URL.

## Gallery

Create a Gallery leaf bundle:

```text
content/gallery/
├── index.md
└── images/
    ├── beach.jpg
    └── city.jpg
```

```yaml
---
title: "Gallery"
type: gallery
---
```

The default timeline groups images by EXIF capture day and falls back to a `YYYYMMDD-HHMMSS` filename. Set `timeline: false` for one continuous waterfall.

Enable EXIF fields while explicitly excluding GPS:

```toml
[imaging.meta]
  sources = ["exif"]
  fields = ["**", "! *GPS*"]
```

Inline galleries use the same lightbox:

```md
{{</* gallery */>}}
{{</* gallery match="trip/*" thumb="600" reverse="true" */>}}
```

`thumb` overrides `params.imageProcessing.galleryThumbnailWidth` and must be between 200 and 2400 pixels. Gallery thumbnails use two responsive candidates; the lightbox uses the source image unless `lightboxMaxWidth` is configured.

Caption and alt text can be supplied through image resource parameters. A sidecar named `photo.jpg.meta` or `photo.meta` may contain JSON with a `Title`; malformed sidecars are ignored.

For explicit dated groups, define `[[timeline]]` entries in the Gallery page front matter as demonstrated in [exampleSite/content/gallery/index.md](../exampleSite/content/gallery/index.md).

## Comments

Supported providers are Disqus, Giscus, Utterances, and Waline. The configured provider is loaded only when the reader approaches the comment section.

```toml
[params.comments]
  enabled = true
  provider = "giscus"

  [params.comments.giscus]
    repo = "user/repo"
    repoId = "R_xxxxxxxxxx"
    category = "Announcements"
    categoryId = "DIC_xxxxxxxxxx"
    mapping = "pathname"
    reactionsEnabled = "1"
    inputPosition = "bottom"
```

Other required provider settings are:

```toml
[params.comments.disqus]
  shortname = "your-shortname"

[params.comments.utterances]
  repo = "user/repo"
  issueTerm = "pathname"

[params.comments.waline]
  serverURL = "https://comments.example.com/"
```

Only configure the provider selected by `provider`. Set `comments: false` in page front matter to disable comments on one page.

Comment providers receive the page URL and browser/network metadata and may set cookies. Review the selected provider's privacy terms before enabling it.

## Sponsor cards

Sponsor is global configuration, not a shortcode. It renders native disclosure cards and can generate QR images during the Hugo build.

```toml
[params.sponsor]
  enabled = true

  [[params.sponsor.items]]
    title = "Support this site"
    address = "replace-with-a-real-value"
    badge = "COPY"
```

For each item, provide an existing `qr` image, a `qrtext` value, or an `address`. Never publish private keys or secret payment credentials. Set `sponsor: false` on a page to hide the section.

## Music

The music shortcode supports provider metadata or a direct audio URL:

```md
{{</* music server="netease" type="song" id="594295" */>}}
{{</* music url="song.mp3" name="Song" artist="Artist" cover="cover.jpg" */>}}
```

APlayer 1.10.1 and MetingJS 2.0.2 load from jsDelivr only on pages containing the shortcode. Provider-based playback also contacts a Meting API. Configure an endpoint you control when privacy or availability matters:

```toml
[params.meting]
  api = "https://music-api.example.com/?server=:server&type=:type&id=:id&auth=:auth&r=:r"
```

## Math

Enable Goldmark passthrough for build-time KaTeX rendering:

```toml
[markup.goldmark.extensions.passthrough]
  enable = true
  [markup.goldmark.extensions.passthrough.delimiters]
    block = [['\[', '\]'], ['$$', '$$']]
    inline = [['\(', '\)']]
```

Beacon intentionally omits single-dollar inline delimiters because they conflict with ordinary currency text. Only the KaTeX stylesheet is loaded on pages that contain math.

## Spoilers

Enable Goldmark's unsafe renderer when content needs inline HTML:

```toml
[markup.goldmark.renderer]
  unsafe = true
```

Then use:

```html
<span class="spoiler">Hidden until focused or hovered</span>
```

The text remains accessible to keyboard users and readers who request reduced motion.

## Iconify

Beacon ships common social icons as inline SVG without network requests. To use arbitrary Iconify names, enable:

```toml
[params]
  iconify = true
```

An icon such as `simple-icons:telegram` then loads through the pinned Iconify web component. Keep Iconify disabled when the extra third-party request is not wanted.

## Multilingual sites

The bundled UI languages are `en`, `zh-cn`, `zh-tw`, and `ja`.

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

Translate content with filename suffixes such as `about.zh-cn.md`. Use `pageRef` instead of hard-coded translated paths. For an RTL language, set `direction = "rtl"` inside that language's parameter table.

## Customization hooks

Override these empty partials in the site without copying the document shell:

| Site file | Position |
| --- | --- |
| `layouts/partials/extend_head.html` | End of `<head>` |
| `layouts/partials/extend_footer.html` | End of `<body>`, after theme JavaScript |

Colors, surfaces, type, and layout dimensions are CSS variables in `assets/scss/_variables.scss`. Copy only the partial or layout that needs changing; site files take precedence over theme files.
