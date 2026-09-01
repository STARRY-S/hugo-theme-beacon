import assert from "node:assert/strict";
import { copyFileSync, existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const hugo = process.env.HUGO_BIN || "hugo";

function runHugo(args, options = {}) {
  const result = spawnSync(hugo, args, {
    cwd: root,
    encoding: "utf8",
    env: process.env,
    ...options,
  });
  return result;
}

function buildExample(pathPrefix) {
  const output = mkdtempSync(join(tmpdir(), "beacon-output-"));
  const cache = mkdtempSync(join(tmpdir(), "beacon-cache-"));
  const result = runHugo([
    "--source", "exampleSite",
    "--destination", output,
    "--cacheDir", cache,
    "--baseURL", `https://example.test${pathPrefix}`,
    "--environment", "production",
    "--minify",
    "--noBuildLock",
    "--panicOnWarning",
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return output;
}

function text(output, path) {
  return readFileSync(join(output, path), "utf8");
}

function filesUnder(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...filesUnder(path));
    else files.push(path);
  }
  return files;
}

function attributeValues(html, name) {
  const pattern = new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "gi");
  return Array.from(html.matchAll(pattern), (match) => match[1] ?? match[2] ?? match[3]);
}

function assertHtmlIntegrity(output, pathPrefix) {
  const origin = "https://example.test";
  const htmlFiles = filesUnder(output).filter((path) => path.endsWith(".html"));
  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    const ids = attributeValues(html, "id");
    assert.equal(new Set(ids).size, ids.length, `duplicate id in ${relative(output, file)}`);
    assert.doesNotMatch(html, /<p(?:\s[^>]*)?>\s*<(?:div|figure|section|details|table|ul|ol|p)\b/i, `invalid nested block in ${relative(output, file)}`);

    for (const raw of [...attributeValues(html, "href"), ...attributeValues(html, "src")]) {
      if (!raw || raw.startsWith("#") || /^(?:mailto|tel|data|javascript):/i.test(raw)) continue;
      const url = new URL(raw, origin);
      if (url.origin !== origin) continue;
      assert.ok(url.pathname.startsWith(pathPrefix), `URL escaped ${pathPrefix}: ${raw} in ${relative(output, file)}`);
      let localPath = decodeURIComponent(url.pathname.slice(pathPrefix.length));
      if (!localPath || localPath.endsWith("/")) localPath += "index.html";
      assert.ok(existsSync(join(output, localPath)), `broken internal URL ${raw} in ${relative(output, file)}`);
    }

    for (const match of html.matchAll(/<script\b[^>]*type=(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi)) {
      assert.doesNotThrow(() => JSON.parse(match[1]), `invalid JSON-LD in ${relative(output, file)}`);
    }
  }
}

function assertExample(output, pathPrefix) {
  const prefix = pathPrefix === "/" ? "/" : pathPrefix;
  const home = text(output, "index.html");
  assert.match(home, /<body class="list kind-home type-page has-sidebar sidebar-left sidebar-mobile-enabled"/);
  assert.match(home, /id=nav-toggle[^>]+aria-controls=nav-menu/);

  const page2 = text(output, "page/2/index.html");
  assert.match(page2, /<title>Beacon Demo · Page 2<\/title>/);
  assert.match(page2, new RegExp(`rel=canonical href=https://example\\.test${prefix === "/" ? "/" : prefix}page/2/`));
  assert.match(page2, new RegExp(`property="og:url" content="https://example\\.test${prefix === "/" ? "/" : prefix}page/2/"`));
  assert.match(page2, new RegExp(`rel=prev href=https://example\\.test${prefix}`));
  assert.doesNotMatch(page2, /hreflang=/);

  const notFound = text(output, "404.html");
  assert.match(notFound, /name=robots content="noindex, follow"/);
  assert.doesNotMatch(notFound, /rel=canonical|hreflang=|property="og:url"/);

  const chinesePost = text(output, "zh-cn/posts/welcome-to-beacon/index.html");
  assert.match(chinesePost, new RegExp(`href=${prefix}zh-cn/tags/hugo/`));
  assert.match(chinesePost, new RegExp(`href=${prefix}zh-cn/posts/`));
  assert.match(chinesePost, /<body class="single kind-page type-posts"/);
  assert.doesNotMatch(chinesePost, /id=sidebar/);
  assert.match(chinesePost, /class=breadcrumbs/);
  // Hugo releases before locale became the primary localization key fall back
  // to English here; both supported versions must still honor the date token.
  assert.match(chinesePost, /<time datetime=2026-07-01T09:00:00(?:\+|&#43;)08:00>(?:2026年7月1日|July 1, 2026)<\/time>/);
  const chineseHome = text(output, "zh-cn/index.html");
  assert.match(chineseHome, new RegExp(`src=${prefix}images/avatar\\.svg`));
  assert.match(chineseHome, /class=sidebar-avatar[^>]+width=128 height=128/);
  assert.match(chineseHome, new RegExp(`href=${prefix}zh-cn/index\\.xml`));
  assert.match(chineseHome, /class="?entry-pinned"?>置顶</);

  const about = text(output, "about/index.html");
  assert.match(about, /<body class="single kind-page type-page"/);
  assert.doesNotMatch(about, /class=breadcrumbs/);
  assert.doesNotMatch(about, /class=sponsor-wrapper|id=comments/);
  assert.match(about, new RegExp(`<img[^>]+src=${prefix}images/screenshots/beacon-home-dark\\.png[^>]*>`));
  const noToc = text(output, "posts/notes-on-writing-more/index.html");
  assert.doesNotMatch(noToc, /class=toc(?:\s|>)/);
  assert.doesNotMatch(page2, /Lowering the bar until publishing/);

  const section = text(output, "posts/index.html");
  assert.match(section, /<body class="list kind-section type-posts has-sidebar sidebar-left sidebar-mobile-enabled"/);
  assert.match(section, new RegExp(`href=${prefix}posts/2025/nested-section/`));

  const gallery = text(output, "gallery/index.html");
  assert.match(gallery, /<body class="single kind-page type-gallery"/);
  assert.doesNotMatch(gallery, /id=sidebar/);
  assert.match(gallery, /<picture>/);
  assert.match(gallery, /type=image\/webp/);
  assert.match(gallery, new RegExp(`srcset="${prefix}gallery/`));
  assert.match(gallery, /class="gallery__img zoomable"[^>]*width=\d+ height=\d+/);
  assert.match(gallery, /loading=eager fetchpriority=high/);
  assert.equal((gallery.match(/fetchpriority=high/g) || []).length, 1);
  const gallerySource = gallery.match(/<source type=image\/webp[^>]+>/)?.[0] || "";
  const galleryImage = gallery.match(/<img class="gallery__img zoomable"[^>]+>/)?.[0] || "";
  assert.equal((gallerySource.match(/\.webp/g) || []).length, 2, "gallery should emit only its two responsive WebP widths");
  assert.match(gallerySource, / 400w, .* 1200w/, "gallery should provide a high-DPI 1200px thumbnail without adding another candidate");
  assert.doesNotMatch(galleryImage, /\bsrcset=/, "gallery fallback should be a single original-format thumbnail");
  assert.match(galleryImage, new RegExp(`data-full=${prefix}gallery/images/[\\w-]+\\.jpg`), "gallery lightbox should use the original resource");

  const sponsor = chinesePost.match(/<img class=sponsor-qr[^>]+>/)?.[0] || "";
  assert.match(sponsor, /width=\d+/);
  assert.match(sponsor, /height=\d+/);
  assert.match(chinesePost, /<details class=sponsor-wrapper>/);

  const robots = text(output, "robots.txt");
  assert.match(robots, new RegExp(`Sitemap: https://example\\.test${prefix}sitemap\\.xml`));
  assertHtmlIntegrity(output, prefix);
}

function fixtureSite(contentFiles, extraConfig = "") {
  const source = mkdtempSync(join(tmpdir(), "beacon-fixture-"));
  mkdirSync(join(source, "content", "posts", "nested"), { recursive: true });
  writeFileSync(join(source, "hugo.toml"), `
baseURL = "https://fixture.test/"
title = "Fixture"
enableRobotsTXT = true
[pagination]
  pagerSize = 2
[params]
  mainSections = ["posts"]
  showSummary = true
  showToc = true
  showBreadcrumbs = true
${extraConfig}
`);
  for (const [name, body] of Object.entries(contentFiles)) {
    const path = join(source, "content", "posts", "nested", name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body);
  }
  return source;
}

function buildFixture(source, expectSuccess = true) {
  const output = mkdtempSync(join(tmpdir(), "beacon-fixture-output-"));
  const result = runHugo([
    "--source", source,
    "--themesDir", dirname(root),
    "--theme", basename(root),
    "--destination", output,
    "--cacheDir", mkdtempSync(join(tmpdir(), "beacon-fixture-cache-")),
    "--environment", "production",
    "--noBuildLock",
  ]);
  if (expectSuccess) assert.equal(result.status, 0, result.stderr || result.stdout);
  else assert.notEqual(result.status, 0, "invalid fixture unexpectedly built");
  return { output, result };
}

const rootOutput = buildExample("/");
assertExample(rootOutput, "/");
const subpathOutput = buildExample("/blog/");
assertExample(subpathOutput, "/blog/");

const indexingSource = fixtureSite({
  "public.md": "---\ntitle: Public\ndate: 2026-01-02\ntags: [fixture]\npinned: true\nshowDate: false\n---\n\n## Public heading\n",
  "hidden.md": "---\ntitle: Hidden\ndate: 2026-01-01\ntags: [fixture]\nnoindex: true\nshowSummary: false\nshowToc: false\nshowBreadcrumbs: false\n---\n\n## Hidden heading\n",
  "legacy.md": "---\ntitle: Legacy\ndate: 2025-12-31\ntags: [fixture]\nprivate: true\n---\n\nLegacy alias.\n",
});
const indexing = buildFixture(indexingSource).output;
assert.match(text(indexing, "index.html"), /class="?entry-pinned"?>Pinned</);
assert.doesNotMatch(text(indexing, "posts/nested/public/index.html"), /<time datetime=2026-01-02/);
assert.match(text(indexing, "posts/nested/hidden/index.html"), /name="robots" content="noindex, follow"/);
assert.doesNotMatch(text(indexing, "posts/nested/hidden/index.html"), /class="breadcrumbs"|class="toc"/);
const sitemap = text(indexing, "sitemap.xml");
assert.doesNotMatch(sitemap, /hidden|legacy/);
assert.match(sitemap, /public/);
assert.doesNotMatch(text(indexing, "index.html"), /id="sidebar"/);
const termPage2 = text(indexing, "tags/fixture/page/2/index.html");
assert.match(termPage2, /<title>Fixture · Page 2 · Fixture<\/title>/);
assert.match(termPage2, /rel="canonical" href="https:\/\/fixture\.test\/tags\/fixture\/page\/2\/"/);
assert.match(termPage2, /property="og:url" content="https:\/\/fixture\.test\/tags\/fixture\/page\/2\/"/);
assert.match(termPage2, /rel="prev" href="https:\/\/fixture\.test\/tags\/fixture\/"/);

const lastmodSource = fixtureSite({
  "updated.md": "---\ntitle: Updated\ndate: 2026-01-02T03:04:05+08:00\nlastmod: 2026-02-03T04:05:06+08:00\n---\n\nUpdated fixture.\n",
}, `
  showLastmod = true
  postDateFormat = "2006-01-02 15:04:05 UTCZ07:00"
`);
const lastmodOutput = buildFixture(lastmodSource).output;
const updatedPost = text(lastmodOutput, "posts/nested/updated/index.html");
assert.match(updatedPost, /datetime="?2026-01-02T03:04:05(?:\+|&#43;)08:00"?>2026-01-02 03:04:05 UTC(?:\+|&#43;)08:00<\/time>/);
assert.match(updatedPost, /Last updated<\/span>\s*<time datetime="?2026-02-03T04:05:06(?:\+|&#43;)08:00"?>2026-02-03 04:05:06 UTC(?:\+|&#43;)08:00<\/time>/);
assert.doesNotMatch(text(lastmodOutput, "index.html"), /Last updated/);

const sidebarCompatibilitySource = fixtureSite({
  "sidebar.md": "---\ntitle: Sidebar page\ndate: 2026-01-01\ntags: [Alpha, Beta]\n---\n\nSidebar fixture.\n",
  "sidebar-two.md": "---\ntitle: Second sidebar page\ndate: 2026-01-02\ntags: [Alpha]\n---\n\nSecond sidebar fixture.\n",
}, `
[params.sidebar]
  enabled = true
  author = "Fixture author"
  showTopTags = true
  topTagsLimit = 1
`);
const sidebarCompatibility = buildFixture(sidebarCompatibilitySource).output;
assert.match(text(sidebarCompatibility, "index.html"), /has-sidebar[^"]*sidebar-mobile-enabled/);
assert.match(text(sidebarCompatibility, "index.html"), /class="sidebar-tag" href="\/tags\/alpha\/"/);
assert.doesNotMatch(text(sidebarCompatibility, "index.html"), /class="sidebar-tag" href="\/tags\/beta\/"/);
assert.match(text(sidebarCompatibility, "posts/nested/sidebar/index.html"), /has-sidebar[^"]*sidebar-mobile-enabled/);

const listOnlySidebarSource = fixtureSite({
  "list-only.md": "---\ntitle: List only\ndate: 2026-01-01\n---\n\nList-only fixture.\n",
}, `
[params.sidebar]
  enabled = true
  showOnSingle = false
  showOnMobile = false
  author = "Fixture author"
`);
const listOnlySidebar = buildFixture(listOnlySidebarSource).output;
assert.match(text(listOnlySidebar, "index.html"), /has-sidebar sidebar-left/);
assert.doesNotMatch(text(listOnlySidebar, "index.html"), /sidebar-mobile-enabled/);
assert.doesNotMatch(text(listOnlySidebar, "posts/nested/list-only/index.html"), /has-sidebar|id=sidebar/);

const drawerSidebarSource = fixtureSite({
  "drawer.md": "---\ntitle: Drawer sidebar\ndate: 2026-01-01\n---\n\nDrawer fixture.\n",
}, `
[params.sidebar]
  enabled = true
  showOnSingle = false
  collapsibleOnSingle = true
  showOnMobile = false
  author = "Fixture author"
`);
const drawerSidebar = text(buildFixture(drawerSidebarSource).output, "posts/nested/drawer/index.html");
assert.match(drawerSidebar, /<body class="?single kind-page type-posts sidebar-drawer-enabled sidebar-left/);
assert.doesNotMatch(drawerSidebar, /\bhas-sidebar\b/);
assert.match(drawerSidebar, /id="?sidebar-toggle"?/);
assert.match(drawerSidebar, /id="?sidebar"?/);
assert.match(drawerSidebar, /class="?sidebar-overlay"? hidden/);

const profileSource = fixtureSite({
  "profile-post.md": "---\ntitle: Profile post\ndate: 2026-01-01\n---\n\nProfile fixture.\n",
}, `
[params.profileMode]
  enabled = true
  title = "Profile fixture"
  subtitle = "A compact home page"
  [[params.profileMode.buttons]]
    name = "Posts"
    pageRef = "/posts"
`);
const profileHome = text(buildFixture(profileSource).output, "index.html");
assert.match(profileHome, /class="profile"/);
assert.match(profileHome, /href="\/posts\/"/);
assert.doesNotMatch(profileHome, /class="post-list"/);

const vectorSource = fixtureSite({
  "vector-post.md": "---\ntitle: Vector post\ndate: 2026-01-01\n---\n\nVector fixture.\n",
});
mkdirSync(join(vectorSource, "content", "gallery"), { recursive: true });
writeFileSync(join(vectorSource, "content", "gallery", "index.md"), "---\ntitle: Vector gallery\ntype: gallery\ntimeline: false\n---\n");
writeFileSync(join(vectorSource, "content", "gallery", "diagram.svg"), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10H0z"/></svg>');
const vectorGallery = text(buildFixture(vectorSource).output, "gallery/index.html");
assert.match(vectorGallery, /src="\/gallery\/diagram\.svg"/);
assert.doesNotMatch(vectorGallery, /<picture>/);

const imageSource = fixtureSite({
  "image-quality/index.md": `---
title: Image quality
date: 2026-01-01
---

![Small image](small.jpg)

![Large image](large.jpg)

{{< gallery match="large.jpg" thumb=600 >}}
`,
}, `
[params.imageProcessing]
  quality = 82
  contentMaxWidth = 1200
  galleryThumbnailWidth = 1000
  lightboxMaxWidth = 1500
`);
const imageBundle = join(imageSource, "content", "posts", "nested", "image-quality");
copyFileSync(join(root, "exampleSite", "content", "gallery", "images", "desk.jpg"), join(imageBundle, "small.jpg"));
copyFileSync(join(root, "exampleSite", "content", "gallery", "images", "city-night.jpg"), join(imageBundle, "large.jpg"));
const imageOutput = buildFixture(imageSource).output;
const imagePost = text(imageOutput, "posts/nested/image-quality/index.html");
const smallImage = imagePost.match(/<img class="zoomable" src="\/posts\/nested\/image-quality\/small\.jpg"[^>]+>/)?.[0] || "";
assert.ok(smallImage, "small Markdown image should use its source file directly");
assert.match(smallImage, /data-full="\/posts\/nested\/image-quality\/small\.jpg"/);
assert.doesNotMatch(smallImage, /_hu_|srcset=/, "small Markdown image should not be re-encoded");
const largeSource = imagePost.match(/<source type="image\/webp"[^>]+large_hu_[^>]+>/)?.[0] || "";
const largeImage = imagePost.match(/<img class="zoomable" src="\/posts\/nested\/image-quality\/large\.jpg"[^>]+>/)?.[0] || "";
assert.match(largeSource, / 720w, .* 1200w/, "oversized Markdown image should stop at the configured display width");
assert.doesNotMatch(largeSource, / 1440w| 1600w/, "oversized display candidates must not exceed the configured width");
assert.match(largeImage, /data-full="\/posts\/nested\/image-quality\/large_hu_[^"]+\.jpg"/, "configured lightbox cap should create a separate full image");
const inlineGallerySource = imagePost.match(/<div class="gallery">[\s\S]*?<source type="image\/webp"([^>]+)>/)?.[1] || "";
assert.match(inlineGallerySource, / 400w, .* 600w/, "shortcode thumb should override the global gallery thumbnail width");

for (const [name, body, expected] of [
  ["bad-gallery.md", "---\ntitle: Bad gallery\n---\n\n{{< gallery thumb=100 >}}\n", "thumb must be between 200 and 2400"],
  ["bad-music.md", "---\ntitle: Bad music\n---\n\n{{< music >}}\n", "music shortcode: provide"],
]) {
  const invalid = fixtureSite({ [name]: body });
  const result = buildFixture(invalid, false).result;
  assert.match(result.stderr + result.stdout, new RegExp(expected));
}

console.log(`Generated-output checks passed with ${hugo}.`);
