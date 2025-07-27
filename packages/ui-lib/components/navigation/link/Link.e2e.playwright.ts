import { expect, test } from "@playwright/test";

test.describe("Link E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/link");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays link examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Link");
    await expect(page.locator(".link").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Link");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/\/link$/);
  });

  test("link examples render correctly", async ({ page }) => {
    const links = page.locator(".link");
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThanOrEqual(1);
  });

  test("link interaction works", async ({ page }) => {
    const links = page.locator(".link");
    const hasLinks = await links.count() > 0;

    if (hasLinks) {
      const link = links.first();
      await link.hover();
      await expect(link).toBeVisible();

      // Test focus
      await link.focus();
      await expect(link).toBeFocused();
    }
  });

  test("link colors work correctly", async ({ page }) => {
    const colorClasses = [".link-primary", ".link-secondary", ".link-accent", ".link-neutral"];

    for (const colorClass of colorClasses) {
      const coloredLinks = page.locator(colorClass);
      const hasColored = await coloredLinks.count() > 0;

      if (hasColored) {
        await expect(coloredLinks.first()).toBeVisible();
      }
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="link-primary"')).toBeVisible();
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".link").first()).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();
    await page.goto("http://localhost:8001/components/layout/link");
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
