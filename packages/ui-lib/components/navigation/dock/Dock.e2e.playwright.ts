import { expect, test } from "@playwright/test";

test.describe("Dock E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/dock");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays dock examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Dock");
    await expect(page.locator(".dock").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Dock");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/dock$/);
  });

  test("dock examples render correctly", async ({ page }) => {
    const docks = page.locator(".dock");
    const dockCount = await docks.count();
    expect(dockCount).toBeGreaterThanOrEqual(1);

    // Check for dock items
    await expect(page.locator(".dock-item").first()).toBeVisible();
  });

  test("dock item interaction works", async ({ page }) => {
    const dockButtons = page.locator(".dock button");
    const hasButtons = await dockButtons.count() > 0;

    if (hasButtons) {
      const button = dockButtons.first();
      await button.click();
      await expect(button).toBeVisible();

      // Test hover effect
      await button.hover();
      await expect(button).toBeVisible();
    }
  });

  test("dock orientations work correctly", async ({ page }) => {
    const verticalDocks = page.locator(".dock-vertical");
    const horizontalDocks = page.locator(".dock-horizontal");

    const hasVertical = await verticalDocks.count() > 0;
    const hasHorizontal = await horizontalDocks.count() > 0;

    if (hasVertical) {
      await expect(verticalDocks.first()).toBeVisible();
    }

    if (hasHorizontal) {
      await expect(horizontalDocks.first()).toBeVisible();
    }
  });

  test("dock accessibility", async ({ page }) => {
    const dockButtons = page.locator(".dock button");
    const buttonCount = await dockButtons.count();

    // Test keyboard navigation
    for (let i = 0; i < Math.min(3, buttonCount); i++) {
      const button = dockButtons.nth(i);
      await button.focus();
      await expect(button).toBeFocused();

      // Test Enter key
      await page.keyboard.press("Enter");
      await expect(button).toBeVisible();
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="dock-item"')).toBeVisible();
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".dock").first()).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();
    await page.goto("http://localhost:8001/components/dock");
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
