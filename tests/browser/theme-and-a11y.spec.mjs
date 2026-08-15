import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:1414)/, (route) => route.abort());
});

test("theme cycles Auto, Light, Dark and follows the system", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.evaluate(() => localStorage.removeItem("beacon-theme"));
  await page.reload();

  const root = page.locator("html");
  const toggle = page.locator("#theme-toggle");
  await expect(root).toHaveAttribute("data-theme", "auto");
  await expect(root).toHaveClass(/dark/);

  const events = await page.evaluate(() => {
    window.__beaconEvents = [];
    document.addEventListener("beacon:themechange", (event) => window.__beaconEvents.push(event.detail));
    return window.__beaconEvents;
  });
  expect(events).toEqual([]);

  await toggle.click();
  await expect(root).toHaveAttribute("data-theme", "light");
  expect(await page.evaluate(() => localStorage.getItem("beacon-theme"))).toBe("light");

  await toggle.click();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await toggle.click();
  await expect(root).toHaveAttribute("data-theme", "auto");
  expect(await page.evaluate(() => localStorage.getItem("beacon-theme"))).toBeNull();

  await page.emulateMedia({ colorScheme: "light" });
  await expect(root).not.toHaveClass(/dark/);
  const detail = await page.evaluate(() => window.__beaconEvents.at(-1));
  expect(detail).toEqual({ mode: "auto", isDark: false });
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
