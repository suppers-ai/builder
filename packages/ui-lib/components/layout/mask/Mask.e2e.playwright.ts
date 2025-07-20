import { expect, test } from "@playwright/test";

test.describe("Mask E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/mask");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays mask examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Mask");
    await expect(page.locator(".mask").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Mask");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/mask$/);
  });

  test("mask examples render correctly", async ({ page }) => {
    const masks = page.locator(".mask");
    const maskCount = await masks.count();
    expect(maskCount).toBeGreaterThanOrEqual(1);
  });

  test("mask shapes work correctly", async ({ page }) => {
    const shapeClasses = [
      ".mask-squircle",
      ".mask-heart",
      ".mask-hexagon",
      ".mask-star",
      ".mask-circle",
      ".mask-triangle",
    ];

    for (const shapeClass of shapeClasses) {
      const shapeMasks = page.locator(shapeClass);
      const hasShape = await shapeMasks.count() > 0;

      if (hasShape) {
        await expect(shapeMasks.first()).toBeVisible();
      }
    }
  });

  test("mask with images works", async ({ page }) => {
    const imageMasks = page.locator(".mask img");
    const hasImages = await imageMasks.count() > 0;

    if (hasImages) {
      const imageMask = imageMasks.first();
      await expect(imageMask).toBeVisible();

      // Check if image loaded
      await expect(imageMask).toHaveJSProperty("complete", true);
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="mask-squircle"')).toBeVisible();
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".mask").first()).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();
    await page.goto("http://localhost:8001/components/layout/mask");
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
