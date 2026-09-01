# Beacon architecture

This document records constraints that are easy to break during otherwise reasonable refactors.

## Build and layout

`baseof.html` owns the document shell. Home and taxonomy lists share `pagination-pages.html`; section archives intentionally use `RegularPagesRecursive`, remain unpaginated, and group entries by publication year. This keeps nested content visible while preserving the archive timeline.

SCSS is compiled by Hugo Pipes with the external Dart Sass transpiler. `main.scss` uses `@use`; placeholders shared through `_base.scss` must be imported in every module that extends them. Production output remains one fingerprinted stylesheet and one small fingerprinted first-party script.

The layout is editorial rather than card-based. The site shell tops out at 1200px, list content at 880px, normal reading content at 760px, and galleries at 1100px. A 260px desktop sidebar appears at 1100px and above. `showOnSingle` and `showOnMobile` retain the legacy behavior by default; sites can disable them independently. The opt-in `collapsibleOnSingle` path renders the same sidebar as an overlay drawer for main-section single pages without assigning the `has-sidebar` grid class, so opening it must never reflow the article. Body kind/type classes are the stable styling hooks for these scopes.

The empty `extend_head.html` and `extend_footer.html` partials are supported site override hooks. `extend_footer.html` must not be cached because a site override may vary per page.

## URLs and metadata

There are two URL domains:

- Static resource configuration uses `asset-url.html`. A leading slash means “site-root resource,” not “host root,” so base URL subpaths are retained.
- Configurable navigation uses `link-url.html`. `pageRef` resolves in the active language; normal internal strings use `relLangURL`; absolute, protocol-relative, mail, telephone, and fragment URLs remain unchanged.

Taxonomy links come from Hugo taxonomy page objects. Pagination metadata must use the active paginator URL so page 2 never canonicalizes to page 1. A 404 emits `noindex, follow` without canonical or hreflang. `noindex` pages are omitted from the custom sitemap; `private` is only a deprecated alias and never access control.

## Feature switches

Hugo's `default` function treats `false` as empty. Page-overridable booleans therefore use `param-bool.html`, which checks key presence before choosing the page, site, or supplied default value.

Optional integrations self-gate:

- Comments emit configuration markup only when a complete provider is enabled; their script loads near the viewport.
- Music assets load only when the page contains the shortcode. APlayer 1.10.1 and MetingJS 2.0.2 are pinned with SRI.
- Iconify loads only when enabled. Built-in icons are inline SVG.
- Math is rendered at build time; only the pinned KaTeX stylesheet is conditional.
- Sponsor is global configuration rendered as native `<details>`, with QR generation at build time.

## Images and galleries

Markdown image resources at or below `contentMaxWidth` are published unchanged; larger resources receive non-upscaled WebP display candidates while the lightbox keeps a separate original or configured capped resource. Covers remain responsive display assets. Gallery thumbnails use two candidates and keep their lightbox resource separate. Unsupported, external, SVG, GIF, and static-only sources degrade to a normal image. The first cover or gallery image may be eager/high-priority; later images are lazy. Intrinsic dimensions are emitted whenever Hugo can determine them.

Gallery dates prefer image resource `.Meta.Date`, then a `YYYYMMDD-HHMMSS` filename. `.Meta` requires Hugo 0.155.3, which defines the minimum theme version. Image metadata configuration must exclude GPS. Hand-authored timeline groups, `timeline = false`, and automatic date grouping are separate supported modes.

## Interaction contracts

The theme preference cycle is Auto → Light → Dark → Auto. `beacon-theme=light|dark` remains compatible; Auto deletes the key and follows system changes. `beacon:themechange` carries `{ mode, isDark }`; consumers relying on `isDark` remain supported.

The mobile and optional desktop sidebar drawers and the image lightbox trap focus, close with Escape, restore the opener, and make background content inert. Below 640px the global navigation is a separate disclosure that closes with Escape or an outside click and restores focus; closed links must not remain in the tab order. The Sponsor disclosure must not leave collapsed controls focusable. Hidden back-to-top controls leave the tab order, and reduced-motion preferences disable JavaScript smooth scrolling.

Copy feedback is announced through a live region only after success; failure is localized and does not impersonate success.
