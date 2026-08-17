import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:1414)/, (route) => route.abort());
});

function contrastRatio(foreground, background) {
  const luminance = (color) => {
    const channels = color.match(/[\d.]+/g).slice(0, 3).map((value) => Number(value) / 255);
    const linear = channels.map((value) => value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4);
    return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2]);
  };
  const [lighter, darker] = [luminance(foreground), luminance(background)]
    .sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

test("theme cycles Auto, Light, Dark and follows the system", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("beacon-theme"));
  await page.reload();

  const root = page.locator("html");
  const toggle = page.locator("#theme-toggle");
  await expect(root).toHaveAttribute("data-theme", "auto");
  await expect(root).toHaveClass(/dark/);
  await expect(toggle.locator(".icon-auto")).toBeVisible();
  await expect(toggle.locator(".icon-sun")).toBeHidden();
  await expect(toggle.locator(".icon-moon")).toBeHidden();

  const events = await page.evaluate(() => {
    window.__beaconEvents = [];
    document.addEventListener("beacon:themechange", (event) => window.__beaconEvents.push(event.detail));
    return window.__beaconEvents;
  });
  expect(events).toEqual([]);

  await toggle.click();
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(toggle.locator(".icon-auto")).toBeHidden();
  await expect(toggle.locator(".icon-sun")).toBeVisible();
  await expect(toggle.locator(".icon-moon")).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem("beacon-theme"))).toBe("light");

  await toggle.click();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(toggle.locator(".icon-auto")).toBeHidden();
  await expect(toggle.locator(".icon-sun")).toBeHidden();
  await expect(toggle.locator(".icon-moon")).toBeVisible();
  await toggle.click();
  await expect(root).toHaveAttribute("data-theme", "auto");
  expect(await page.evaluate(() => localStorage.getItem("beacon-theme"))).toBeNull();

  await page.emulateMedia({ colorScheme: "light" });
  await expect(root).not.toHaveClass(/dark/);
  const detail = await page.evaluate(() => window.__beaconEvents.at(-1));
  expect(detail).toEqual({ mode: "auto", isDark: false });
});

test("dark palette keeps content rules and component boundaries visible", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("beacon-theme", "dark"));
  await page.goto("/posts/welcome-to-beacon/");

  const colors = await page.evaluate(() => {
    const content = document.querySelector(".post-content");
    const rule = document.createElement("hr");
    const divider = document.createElement("div");
    divider.style.borderTop = "1px solid var(--color-divider)";
    content.append(rule, divider);

    const style = (element) => getComputedStyle(element);
    const body = document.body;
    const toc = document.querySelector(".toc");
    const tag = document.querySelector(".post-tags .tag");
    const tableCell = document.querySelector(".post-content td");

    return {
      surface: style(body).backgroundColor,
      raisedSurface: style(toc).backgroundColor,
      componentBorder: style(toc).borderTopColor,
      divider: style(divider).borderTopColor,
      rule: style(rule).borderTopColor,
      tableBorder: style(tableCell).borderTopColor,
      tag: style(tag).backgroundColor,
    };
  });

  expect(contrastRatio(colors.componentBorder, colors.raisedSurface)).toBeGreaterThanOrEqual(1.3);
  expect(contrastRatio(colors.divider, colors.surface)).toBeGreaterThanOrEqual(1.9);
  expect(contrastRatio(colors.tableBorder, colors.surface)).toBeGreaterThanOrEqual(1.9);
  expect(contrastRatio(colors.rule, colors.surface)).toBeGreaterThanOrEqual(3);
  expect(contrastRatio(colors.tag, colors.surface)).toBeGreaterThanOrEqual(1.3);

  const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
  expect(results.violations).toEqual([]);
});

test("mobile sidebar traps focus, closes with Escape, and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.locator("#sidebar-toggle");
  const sidebar = page.locator("#sidebar");
  await expect(sidebar).toHaveAttribute("aria-hidden", "true");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".sidebar-close")).toBeFocused();
  await expect(page.locator("main")).toHaveJSProperty("inert", true);
  await expect(page.locator("main")).toHaveAttribute("aria-hidden", "true");

  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#sidebar a:visible, #sidebar button:visible").last()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(sidebar).toHaveAttribute("aria-hidden", "true");

  await toggle.click();
  await page.setViewportSize({ width: 1200, height: 800 });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(sidebar).not.toHaveAttribute("aria-hidden", "true");
  await expect(sidebar).toHaveJSProperty("inert", false);
});

test("mobile navigation discloses links and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.locator("#nav-toggle");
  const menu = page.locator("#nav-menu");

  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeHidden();
  await expect(menu).toHaveJSProperty("inert", true);

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(menu).toBeVisible();
  await expect(menu).toHaveJSProperty("inert", false);

  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await expect(menu).toBeHidden();

  await toggle.click();
  await page.locator("main").click({ position: { x: 10, y: 10 } });
  await expect(menu).toBeHidden();
});

test("editorial layout stays fluid across sidebar breakpoints", async ({ page }) => {
  const widths = [320, 390, 640, 900, 1099, 1100, 1440];
  const mainWidths = new Map();

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      mainWidth: Math.round(document.querySelector("main").getBoundingClientRect().width),
      sidebarVisible: document.querySelector(".sidebar").getBoundingClientRect().width > 0
        && getComputedStyle(document.querySelector(".sidebar")).visibility !== "hidden",
    }));
    expect(metrics.scrollWidth).toBe(width);
    expect(metrics.sidebarVisible).toBe(width >= 1100);
    mainWidths.set(width, metrics.mainWidth);
  }

  expect(mainWidths.get(1099) - mainWidths.get(1100)).toBeLessThanOrEqual(160);

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [path, maximum] of [["/posts/welcome-to-beacon/", 760], ["/gallery/", 1100]]) {
    await page.goto(path);
    await expect(page.locator("#sidebar")).toHaveCount(0);
    const width = await page.locator("main").evaluate((element) => Math.round(element.getBoundingClientRect().width));
    expect(width).toBeLessThanOrEqual(maximum);
  }
});

test("lightbox traps focus and restores the image trigger", async ({ page }) => {
  await page.goto("/posts/image-preview/");
  const trigger = page.locator(".post-content img.zoomable").first();
  await trigger.focus();
  await trigger.press("Enter");

  const dialog = page.locator(".lightbox");
  await expect(dialog).toHaveClass(/is-open/);
  await expect(page.locator(".lightbox__close")).toBeFocused();
  await expect(page.locator(".container")).toHaveAttribute("aria-hidden", "true");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toHaveClass(/is-open/);
  await expect(trigger).toBeFocused();
});

test("lightbox does not flash the previous image while a new preview loads", async ({ page }) => {
  await page.goto("/gallery/");
  const thumbnails = page.locator(".gallery img.zoomable");
  const firstFull = await thumbnails.nth(0).getAttribute("data-full");
  const secondFull = await thumbnails.nth(1).getAttribute("data-full");
  const firstUrl = new URL(firstFull, page.url()).href;
  const secondUrl = new URL(secondFull, page.url()).href;
  const preview = page.locator(".lightbox__img");

  await thumbnails.nth(0).click();
  await expect(preview).not.toHaveClass(/is-loading/);
  expect(new URL(await preview.getAttribute("src"), page.url()).href).toBe(firstUrl);
  await page.keyboard.press("Escape");
  expect(await preview.getAttribute("src")).toBeNull();

  let releaseSecond;
  const secondResponse = new Promise((resolve) => { releaseSecond = resolve; });
  let secondRequested = false;
  await page.route(secondUrl, async (route) => {
    secondRequested = true;
    await secondResponse;
    await route.continue();
  });

  await thumbnails.nth(1).click();
  await expect.poll(() => secondRequested).toBe(true);
  expect(new URL(await preview.getAttribute("src"), page.url()).href).toBe(secondUrl);
  await expect(preview).toHaveClass(/is-loading/);
  await expect(preview).toHaveCSS("opacity", "0");

  releaseSecond();
  await expect(preview).not.toHaveClass(/is-loading/);
  await expect(preview).toHaveCSS("opacity", "1");
});

test("Sponsor disclosure hides controls when collapsed", async ({ page }) => {
  await page.goto("/posts/welcome-to-beacon/");
  const details = page.locator("details.sponsor-wrapper");
  const summary = details.locator("summary");
  const address = details.locator(".sponsor-address").first();
  await expect(details).not.toHaveAttribute("open", "");
  await expect(address).not.toBeVisible();

  await summary.click();
  await expect(address).toBeVisible();
  await address.focus();
  await summary.click();
  await expect(address).not.toBeVisible();
  await expect(address).not.toBeFocused();
});

test("copy feedback reports real success through the live region", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    });
  });
  await page.goto("/posts/welcome-to-beacon/");
  const button = page.locator(".copy-code").first();
  await button.click();
  await expect(button).toHaveText(/Copied!/);
  await expect(page.locator("#copy-status")).toHaveText(/Copied!/);

  await page.evaluate(() => {
    navigator.clipboard.writeText = () => Promise.reject(new Error("denied"));
    document.execCommand = () => false;
  });
  await button.click();
  await expect(button).toHaveText(/Copy failed/);
  await expect(page.locator("#copy-status")).toHaveText(/Copy failed/);
});

test("back-to-top leaves the tab order while hidden and honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/posts/markdown-showcase/");
  const button = page.locator(".back-to-top");
  await expect(button).toBeHidden();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(button).toBeVisible();
  await button.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(button).toBeHidden();
});

test("optional third-party assets stay scoped and the homepage passes axe", async ({ page }) => {
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/about/");
  expect(requests.some((url) => /aplayer|meting|giscus|utteranc|disqus|waline/i.test(url))).toBe(false);

  await page.goto("/");
  await page.waitForTimeout(600);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

for (const path of ["/", "/posts/welcome-to-beacon/", "/gallery/", "/tags/"]) {
  for (const theme of ["light", "dark"]) {
    test(`${path} passes axe in ${theme} mode`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem("beacon-theme", value), theme);
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

for (const visual of [
  { name: "home-desktop-light", path: "/", width: 1440, height: 1000, theme: "light" },
  { name: "home-mobile-dark", path: "/", width: 390, height: 844, theme: "dark" },
  { name: "post-desktop-dark", path: "/posts/welcome-to-beacon/", width: 1440, height: 1000, theme: "dark" },
  { name: "post-mobile-light", path: "/posts/welcome-to-beacon/", width: 390, height: 844, theme: "light" },
  { name: "gallery-desktop-light", path: "/gallery/", width: 1440, height: 1000, theme: "light" },
  { name: "gallery-mobile-dark", path: "/gallery/", width: 390, height: 844, theme: "dark" },
  { name: "tags-desktop-dark", path: "/tags/", width: 1440, height: 1000, theme: "dark" },
  { name: "tags-mobile-light", path: "/tags/", width: 390, height: 844, theme: "light" },
]) {
  test(`visual regression: ${visual.name}`, async ({ page }) => {
    await page.setViewportSize({ width: visual.width, height: visual.height });
    await page.addInitScript((theme) => localStorage.setItem("beacon-theme", theme), visual.theme);
    await page.goto(visual.path);
    await expect(page).toHaveScreenshot(`${visual.name}.png`, {
      animations: "disabled",
      maxDiffPixelRatio: 0.01,
    });
  });
}
