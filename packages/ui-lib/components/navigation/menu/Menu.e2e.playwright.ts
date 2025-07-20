import { expect, test } from "@playwright/test";

test.describe("Menu E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/navigation/menu");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays menu examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Menu");
    await expect(page.locator(".menu").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Menu");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/menu$/);
  });

  test("menu examples render correctly", async ({ page }) => {
    const menus = page.locator(".menu");
    const menuCount = await menus.count();
    expect(menuCount).toBeGreaterThanOrEqual(1);

    // Check for menu items
    await expect(page.locator(".menu li").first()).toBeVisible();
  });

  test("menu item interaction works", async ({ page }) => {
    const menuLinks = page.locator(".menu a");
    const hasLinks = await menuLinks.count() > 0;

    if (hasLinks) {
      const link = menuLinks.first();
      await link.click();
      await expect(link).toBeVisible();

      // Test hover effect
      await link.hover();
      await expect(link).toBeVisible();
    }
  });

  test("menu orientations work correctly", async ({ page }) => {
    const verticalMenus = page.locator(".menu:not(.menu-horizontal)");
    const horizontalMenus = page.locator(".menu-horizontal");

    const hasVertical = await verticalMenus.count() > 0;
    const hasHorizontal = await horizontalMenus.count() > 0;

    if (hasVertical) {
      await expect(verticalMenus.first()).toBeVisible();
    }

    if (hasHorizontal) {
      await expect(horizontalMenus.first()).toBeVisible();
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="menu-horizontal"')).toBeVisible();
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".menu").first()).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();
    await page.goto("http://localhost:8001/components/navigation/menu");
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
