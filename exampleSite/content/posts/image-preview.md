---
title: "Theme Screenshots & Image Preview"
date: 2026-07-12T21:00:00+08:00
draft: false
tags: ["demo", "images", "design"]
categories: ["guides"]
description: "A look at the Beacon theme, plus a demo of the built-in click-to-zoom image preview."
---

Every image in a post is **click-to-zoom**. Click (or focus and press Enter on)
any picture below to open it full-screen; press <kbd>Esc</kbd> or click the
backdrop to close. When a post has several images, use the arrows or the
<kbd>←</kbd> / <kbd>→</kbd> keys to move between them.

## The theme at a glance

Here is Beacon's homepage in dark mode — a two-column card layout with a profile
sidebar and a paginated post list.

![Beacon homepage in dark mode](/images/screenshots/beacon-home-dark.png "Beacon homepage — dark mode")

The exact same layout in light mode. Light and dark are designed to read
identically; the theme toggle in the header switches between them (and remembers
your choice).

![Beacon homepage in light mode](/images/screenshots/beacon-home-light.png "Beacon homepage — light mode")

A single post shows a breadcrumb trail, post meta, a collapsible table of
contents, and comfortable reading typography.

![A single Beacon post with its table of contents](/images/screenshots/beacon-post-dark.png "Single post view with table of contents")

## How the image preview works

Nothing to configure — it is on by default. Write a normal Markdown image and
the theme handles the rest:

```markdown
![alt text](/images/screenshots/beacon-home-dark.png "An optional caption")
```

- The text in quotes becomes a **caption** under the image and the title in the
  preview.
- Images are lazy-loaded and decode asynchronously, so a picture-heavy post
  stays fast.
- The preview is keyboard accessible and honors `prefers-reduced-motion`.

### Opting out

To keep a specific image from zooming — a small logo or an inline icon, say —
end its caption with `#noZoom`:

```markdown
![Our logo](/images/logo.png "Our logo #noZoom")
```

That image renders normally but won't open the full-screen preview.
