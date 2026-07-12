+++
title = "Gallery"
description = "A photo timeline — grouped by day, click any image to view it full-screen."
type = "gallery"

# ── Timeline ────────────────────────────────────────────────
# Group photos into dated sections (Apple/Google Photos style). Sections show
# newest-first automatically. List images explicitly with `images` (ordered),
# or select them with a `match` glob. Remove this whole block for a plain,
# ungrouped waterfall of every image in the bundle.
[[timeline]]
  date = "2026-03-20"
  title = "City nights"
  description = "A weekend wandering downtown after dark."
  images = ["city-night.jpg", "coffee.jpg", "harbor.jpg"]

[[timeline]]
  date = "2026-02-14"
  title = "Studio days"
  description = "Quiet afternoons at the desk and around the block."
  images = ["desk.jpg", "alley.jpg"]

[[timeline]]
  date = "2026-01-10"
  title = "First snow"
  description = "Woke up to a white morning and went looking for the light."
  images = ["snow.jpg", "mountains.jpg", "garden.jpg", "seaside.jpg"]

# ── Optional per-image captions ─────────────────────────────
# Keyed by filename; `caption` shows on hover and in the lightbox.
[[resources]]
  src = "seaside.jpg"
  [resources.params]
    caption = "Low tide, early light"
[[resources]]
  src = "mountains.jpg"
  [resources.params]
    caption = "Ridge line before the clouds rolled in"
[[resources]]
  src = "city-night.jpg"
  [resources.params]
    caption = "Downtown, long exposure"
+++

A few frames from recent walks, grouped by the day I took them. This page is a
native timeline gallery: define the sections in front matter, drop the photos in
this bundle, and they lay out as a dated masonry waterfall automatically.
