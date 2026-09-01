# Deployment

Beacon produces a conventional static Hugo site. Any host that can run Hugo extended and Dart Sass can publish the generated `public/` directory.

## Production build

Set the real public URL before building:

```toml
baseURL = "https://example.com/"
```

Then run:

```bash
hugo --gc --minify --environment production
```

Publish the contents of `public/`. Do not commit that directory; Hugo recreates it.

For a project hosted below a path, include the path in `baseURL`:

```toml
baseURL = "https://example.com/blog/"
```

Beacon's menus, taxonomies, RSS, assets, canonical URLs, and supported configuration links preserve the subpath. Build with the same public base URL that readers will use.

## Reproducible Sass setup

Continuous integration should pin Dart Sass instead of installing an unversioned `latest`. A site can keep it as an exact development dependency:

```json
{
  "private": true,
  "scripts": {
    "build": "hugo --gc --minify --environment production"
  },
  "devDependencies": {
    "sass-embedded": "1.102.0"
  }
}
```

Commit `package.json` and its lock file. The host can then use:

```bash
npm ci
npm run build
```

Commands launched through `npm run` automatically see `node_modules/.bin`, allowing Hugo to find the pinned Sass executable.

## Static hosting settings

Use these values as a provider-neutral starting point:

| Setting | Value |
| --- | --- |
| Hugo | Extended edition, 0.155.3 or newer |
| Node.js | 24 when installing the pinned Sass package |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Publish directory | `public` |
| Git submodules | Enabled |

If the provider does not initialize Git submodules automatically, run `git submodule update --init --recursive` before the build.

## GitHub Pages

Follow Hugo's official [GitHub Pages guide](https://gohugo.io/host-and-deploy/host-on-github-pages/) and select **GitHub Actions** as the Pages source.

Beacon-specific additions to the official workflow are:

1. Checkout with submodules enabled so `themes/beacon` is present.
2. Install Node.js 24 and run `npm ci` for the pinned `sass-embedded` package.
3. Set up Hugo extended 0.155.3 or newer.
4. Build with the URL returned by the Pages configuration step when deploying a project site below a repository path.
5. Upload `public/`, not the Hugo source repository.

The theme repository's [demo workflow](../.github/workflows/gh-pages.yml) is a tested reference, but it builds `exampleSite/`; adapt the source and output paths for a normal blog.

## Image build cache

The first build after adding or changing many Gallery images can be CPU-intensive. Preserve both Hugo's cache directory and generated resource cache between CI runs. Do not delete them on every deployment unless diagnosing a stale build.

Source images are never overwritten. Cached derivatives and files below `public/` can be recreated from the repository.

## Deployment checklist

- `baseURL` matches the final origin and path.
- Draft, future, and expired pages are included only when intended.
- Comments, music, Iconify, and Sponsor integrations contain production-safe values.
- `hugo --gc --minify --environment production` finishes without warnings.
- Internal links, RSS, sitemap, 404, light/dark themes, and at least one representative image page work on the deployed URL.
