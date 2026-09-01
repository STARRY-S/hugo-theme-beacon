# Getting started

This guide takes a new Hugo site from installation to a local Beacon preview. For theme options, continue with [Configuration](configuration.md) and [Feature guides](features.md).

## Requirements

Beacon requires:

- Hugo **extended** 0.155.3 or newer
- Dart Sass 1.102.0

Node.js is not a Hugo runtime dependency, but the portable installation below uses npm to provide the pinned Sass executable. Node.js 24 is also required when contributing to Beacon or running its repository tests. A normal blog build does not use Beacon's `package.json`.

Install Dart Sass with a version-aware package manager. One portable option is:

```bash
npm install --global sass-embedded@1.102.0
```

Verify the tools before creating the site:

```bash
hugo version
sass --version
```

The Hugo output must say `extended`, and Sass should report `1.102.0`.

## Create a new site

```bash
hugo new site my-blog
cd my-blog
git init
git submodule add https://github.com/STARRY-S/hugo-theme-beacon.git themes/beacon
cp themes/beacon/hugo.example.toml hugo.toml
```

The starter is deliberately conservative: optional network integrations are disabled and no real account or payment information is present.

Do not copy `exampleSite/` into your site. It exists to demonstrate and test nearly every theme feature, including integrations that a public starter should not enable.

## Add content

Use a leaf bundle for posts with local images:

```bash
hugo new content posts/hello/index.md
```

```text
content/
├── about.md
└── posts/
    └── hello/
        ├── index.md
        └── image.jpg
```

Example front matter:

```yaml
---
title: "Hello, Beacon"
date: 2026-09-01T10:00:00+08:00
lastmod: 2026-09-01T12:00:00+08:00
tags: [Hugo, Notes]
categories: [Web]
draft: false
---
```

Place taxonomy landing pages at `content/tags/_index.md` and `content/categories/_index.md` when you want custom titles or introductions.

## Preview locally

```bash
hugo server -D
```

`-D` includes draft content. Use `hugo server` without it when checking what a production build will publish.

To preview Beacon's feature demo from the theme repository:

```bash
hugo server --source exampleSite --disableFastRender --port 1314
```

## Update the theme

Beacon is installed as a Git submodule, so updating the parent repository alone does not move the theme revision.

```bash
git submodule update --remote themes/beacon
git add themes/beacon
git commit -m "chore: update Beacon"
```

Build locally before publishing. Site files that override Beacon layouts or SCSS may need adjustment after a theme update.

When cloning an existing blog, include its submodules:

```bash
git clone --recurse-submodules https://github.com/you/your-blog.git
```

If it was cloned without them:

```bash
git submodule update --init --recursive
```

## Common problems

### Hugo cannot find the theme

Confirm that `theme = "beacon"` is present in `hugo.toml` and that `themes/beacon/theme.toml` exists. Initialize the submodule if the directory is empty.

### Sass compilation fails

Confirm that the Hugo binary is the extended edition and that `sass --version` works in the same shell or build environment. Beacon uses the external Dart Sass transpiler; Hugo extended alone is not sufficient.

### Images are not processed

Hugo can process page resources and files under `assets/`. Images available only under `static/`, remote images, SVG, GIF, and unsupported formats intentionally fall back to normal image URLs.

### The first Gallery build is slow

Hugo has to decode and encode each new derivative once. Keep the Hugo resource and build caches between builds; later builds reuse unchanged results. Beacon generates two Gallery thumbnail candidates per processable image by default.

### Links break below a subpath

Set the real `baseURL` and prefer `pageRef` for content navigation. Beacon's supported URL fields preserve a base path such as `/blog/`; literal HTML links written in content remain your responsibility.

Continue with [Deployment](deployment.md) when the local production build is ready.
