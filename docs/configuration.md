# Configuration

Start from [hugo.example.toml](../hugo.example.toml). It contains a safe, minimal configuration; this guide explains the options most sites are likely to change.

## Site basics

```toml
baseURL = "https://example.com/"
title = "My Blog"
theme = "beacon"
enableRobotsTXT = true

[pagination]
  pagerSize = 10

[taxonomies]
  tag = "tags"
  category = "categories"

[params]
  description = "Notes and articles"
  author = "Your Name"
  mainSections = ["posts"]
```

`mainSections` controls homepage posts, post statistics, pagination, structured article data, and the optional single-page sidebar drawer.

## Post display

```toml
[params]
  dateFormat = ":date_long"
  postDateFormat = ":date_long"
  timelineDateFormat = "01-02"
  summaryLength = 200

  showDate = true
  showReadingTime = true
  showWordCount = true
  showAuthor = true
  showLastmod = false
  showSummary = true
  showToc = true
  showBreadcrumbs = true
  showShareButtons = true
```

`dateFormat` accepts Hugo localized layouts or Go time layouts. `postDateFormat` overrides it only for post metadata. For a compact timestamp, use:

```toml
postDateFormat = "2006-01-02 15:04:05"
```

The complete timestamp, including its UTC offset, remains available in the
semantic `datetime` value and in the tooltip shown when the visible time is
hovered.

When `showLastmod` is enabled, a single page displays its update time only when `.Lastmod` is later than `.PublishDate`.

Every `show…` option above can be overridden in page front matter. Explicit `false` values are preserved:

```yaml
---
title: "About"
showDate: false
showReadingTime: false
showToc: false
showBreadcrumbs: false
---
```

Useful page parameters include:

| Parameter | Effect |
| --- | --- |
| `pinned: true` | Shows a localized pinned badge in post lists |
| `weight` | Controls Hugo's ordering independently of the pinned badge |
| `noindex: true` | Emits `noindex, follow` and excludes the page from the sitemap |
| `comments: false` | Disables comments on one page |
| `sponsor: false` | Hides Sponsor cards on one page |
| `showSidebar` | Overrides the permanent sidebar for one page |
| `showSidebarDrawer` | Overrides the optional single-page sidebar drawer |

The legacy `private: true` parameter remains a deprecated alias for `noindex`. Neither option provides access control; published HTML remains public.

Add a cover to a post with nested front matter. Page-bundle paths are resolved relative to the post:

```yaml
cover:
  image: cover.jpg
  caption: "Optional cover caption"
```

## Menus and links

Use Hugo `pageRef` values for links to content. They resolve in the current language and remain correct when the site uses a base path or custom permalink structure.

```toml
[[menus.main]]
  name = "Posts"
  pageRef = "/posts"
  weight = 10

[[menus.main]]
  name = "Tags"
  pageRef = "/tags"
  weight = 20
```

Social links appear in the sidebar and Profile homepage:

```toml
[[params.social]]
  name = "GitHub"
  icon = "github"
  url = "https://github.com/you"

[[params.social]]
  name = "About"
  icon = "link"
  pageRef = "/about"

[[params.social]]
  name = "RSS"
  icon = "rss"
  url = "/index.xml"
```

Built-in icons make no network request. See [Iconify](features.md#iconify) for arbitrary external icon names.

Static resource settings such as `logo`, `favicon`, and sidebar `avatar` accept paths with or without a leading slash. Both remain under a configured base path. Absolute URLs, protocol-relative URLs, email, telephone, and fragment URLs remain unchanged.

## Sidebar

```toml
[params.sidebar]
  enabled = true
  position = "left"          # left | right
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
  buttonsLayout = "grid"     # grid or the default vertical list

  [[params.sidebar.buttons]]
    name = "Email"
    icon = "email"
    url = "mailto:hello@example.com"

  [[params.sidebar.items]]
    name = "About"
    pageRef = "/about"

  [[params.sidebar.friends]]
    name = "A friend's blog"
    url = "https://example.org/"
```

`showOnSingle = false` keeps long-form pages centered. Combine it with `collapsibleOnSingle = true` to provide the same sidebar in an overlay drawer on pages in `mainSections`. `showOnMobile` independently controls availability below the desktop sidebar breakpoint.

Page-level `showSidebar` and `showSidebarDrawer` values override these defaults. A permanent sidebar takes precedence when both are requested.

## Homepage modes

The default homepage is a paginated post list. Add a short introduction above it with:

```toml
[params.homeInfo]
  title = "Notes from Your Name"
  content = "Writing about systems, photography, and the web."
```

Profile mode replaces the homepage post list with a compact identity page:

```toml
[params.profileMode]
  enabled = true
  title = "Your Name"
  subtitle = "Developer and writer"
  imageUrl = "images/avatar.svg"
  imageWidth = 120
  imageHeight = 120

  [[params.profileMode.buttons]]
    name = "Posts"
    pageRef = "/posts"
```

Social links are shared with the sidebar through `params.social`.

## Footer

```toml
[params.footer]
  since = 2020
  owner = "Your Name"
  showPoweredBy = true

  [params.footer.license]
    name = "CC BY-NC-SA 4.0"
    url = "https://creativecommons.org/licenses/by-nc-sa/4.0/"

  [params.footer.hostedOn]
    name = "GitHub Pages"
    url = "https://pages.github.com/"
```

License and hosting text are optional. `showPoweredBy = false` removes the Hugo and Beacon attribution line.

## Indexing and metadata

Beacon emits canonical and Open Graph URLs, JSON-LD, hreflang, RSS discovery, robots directives, and a sitemap. Pagination pages use their own canonical URL.

Set `noindex = true` globally or per page when content should not appear in search results. A 404 page is always `noindex, follow`. Configure `params.images` with a default social image and `params.twitterUsername` when needed:

```toml
[params]
  images = ["images/social-card.jpg"]
  twitterUsername = "example"
```

Continue with [Feature guides](features.md) for images, Gallery, comments, Sponsor, music, math, and multilingual configuration.
