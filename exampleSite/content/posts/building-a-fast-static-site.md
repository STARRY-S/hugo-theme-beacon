---
title: "Building a Fast Static Site with Hugo"
date: 2026-07-08T10:15:00+08:00
draft: false
tags: ["hugo", "performance", "web"]
categories: ["engineering"]
description: "A few practical habits that keep a Hugo site building in milliseconds and loading instantly."
---

Static sites are fast by default, but it is surprisingly easy to give that speed
away. Here are the habits I keep coming back to.

## Keep the asset pipeline lean

Hugo Pipes can bundle, minify, and fingerprint CSS and JS without any external
tooling. One concatenated, fingerprinted stylesheet beats a dozen render-blocking
requests every time.

- Bundle scripts into a single file
- Minify and fingerprint in production only
- Inline the tiny critical bits (like the theme-flash guard) directly in `<head>`

## Measure the real thing

Build time and page weight are both worth watching:

1. `hugo --gc` for a clean production build
2. A Lighthouse pass on the rendered output
3. A quick look at the total transferred bytes

## Ship less

The fastest request is the one you never make. Prefer system fonts, skip the
heavy framework, and let good typography do the work.

> Performance is a feature — treat regressions like bugs.
