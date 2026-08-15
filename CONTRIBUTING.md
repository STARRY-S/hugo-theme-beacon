# Contributing to Beacon

Beacon is the theme repository; `exampleSite/` is a deliberately feature-rich test fixture, not a starter site.

## Toolchain

- Node.js 24
- Hugo extended 0.155.3 and 0.164.0
- Dart Sass 1.102.0

Install the locked JavaScript dependencies with `npm ci`. Do not install an unversioned `latest` Sass in CI.

## Local checks

```bash
npm ci
npx playwright install chromium
npm run lint
npm run test:output
npm run test:browser
```

To preview the demo without a tracked theme symlink:

```bash
hugo server --source exampleSite --disableFastRender --port 1314
```

Use a non-default port when another local site may already occupy 1313.

## Change guidelines

- Preserve explicit `false` configuration values. Use `param-bool.html` when a site default can be overridden by page front matter.
- Prefer Hugo page objects and `pageRef` to assembling content URLs. Route static resource fields through `asset-url.html` and configurable content links through `link-url.html`.
- Add every user-facing label to all files in `i18n/`.
- Test light, dark, and automatic modes; keyboard focus; a `/blog/` base path; and at least one non-default language.
- Keep comments, music, Iconify, Sponsor, math, gallery, and Profile mode optional. Third-party code must not load on pages that do not need it.
- Use CSS variables for palette/spacing changes. Preserve a generic font-family fallback.
- Keep the theme's own JavaScript and CSS as small combined assets. Optimize images and optional third-party resources before introducing route-level bundles.
- Do not commit `exampleSite/public`, `exampleSite/resources`, Hugo lock files, browser reports, or `node_modules`.

See [docs/architecture.md](docs/architecture.md) for the rationale behind the less obvious constraints.
