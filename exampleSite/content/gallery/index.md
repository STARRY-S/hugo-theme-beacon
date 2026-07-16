+++
title = "Gallery"
description = "A photo timeline — grouped by day, click any image to view it full-screen."
type = "gallery"

# ── Timeline ────────────────────────────────────────────────
# Hand-written photo groups, shown here to demo the syntax. Sections render
# newest-first. List images explicitly with `images` (ordered), or select them
# with a `match` glob.
#
# This block is OPTIONAL: delete it and the page groups the bundle by each
# photo's EXIF date automatically (that is the default). Use `timeline = false`
# for a plain ungrouped waterfall instead.
[[timeline]]
  date = "2026-03-20"
  title = "City nights"
  description = "A weekend wandering downtown after dark."
  images = ["images/city-night.jpg", "images/coffee.jpg", "images/harbor.jpg"]

[[timeline]]
  date = "2026-02-14"
  title = "Studio days"
  description = "Quiet afternoons at the desk and around the block."
  images = ["images/desk.jpg", "images/alley.jpg"]

[[timeline]]
  date = "2026-01-10"
  title = "First snow"
  description = "Woke up to a white morning and went looking for the light."
  images = ["images/snow.jpg", "images/mountains.jpg", "images/garden.jpg", "images/seaside.jpg"]

# ── Optional per-image captions ─────────────────────────────
# Keyed by filename; `caption` shows on hover and in the lightbox.
[[resources]]
  src = "images/seaside.jpg"
  [resources.params]
    caption = "Low tide, early light"
[[resources]]
  src = "images/mountains.jpg"
  [resources.params]
    caption = "Ridge line before the clouds rolled in"
[[resources]]
  src = "images/city-night.jpg"
  [resources.params]
    caption = "Downtown, long exposure"
+++

A few frames from recent walks, grouped by the day I took them. This page is a
native timeline gallery: define the sections in front matter, drop the photos in
this bundle, and they lay out as a dated masonry waterfall automatically.
