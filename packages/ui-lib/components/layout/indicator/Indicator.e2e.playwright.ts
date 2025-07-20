import { expect, test } from "@playwright/test";

test.describe("Indicator E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/indicator");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays indicator examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Indicator");
    await expect(page.locator(".indicator").first()).toBeVisible();
  });

  test("navigation works correctly", async ({ page }) => {
    await expect(page.locator(".breadcrumbs")).toBeVisible();
    await expect(page.locator(".breadcrumbs")).toContainText("Home");
    await expect(page.locator(".breadcrumbs")).toContainText("Components");
    await expect(page.locator(".breadcrumbs")).toContainText("Indicator");

    await page.click('.breadcrumbs a[href="/"]');
    await expect(page).toHaveURL("http://localhost:8001/");

    await page.goBack();
    await expect(page).toHaveURL(/indicator$/);
  });

  test("indicator examples render correctly", async ({ page }) => {
    const indicators = page.locator(".indicator");
    const indicatorCount = await indicators.count();
    expect(indicatorCount).toBeGreaterThanOrEqual(1);

    // Check for indicator items
    await expect(page.locator(".indicator-item").first()).toBeVisible();
  });

  test("indicator positions work correctly", async ({ page }) => {
    const positionClasses = [
      ".indicator-start",
      ".indicator-center",
      ".indicator-end",
      ".indicator-top",
      ".indicator-bottom",
    ];

    for (const positionClass of positionClasses) {
      const positionedIndicators = page.locator(positionClass);
      const hasPositioned = await positionedIndicators.count() > 0;

      if (hasPositioned) {
        await expect(positionedIndicators.first()).toBeVisible();
      }
    }
  });

  test("indicator content is accessible", async ({ page }) => {
    const indicatorItems = page.locator(".indicator-item");
    const itemCount = await indicatorItems.count();

    for (let i = 0; i < Math.min(3, itemCount); i++) {
      const item = indicatorItems.nth(i);
      await expect(item).toBeVisible();

      const textContent = await item.textContent();
      expect(textContent?.trim()).toBeTruthy();
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
    await expect(page.locator('text="indicator-item"')).toBeVisible();
  });

  test("responsive behavior on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator(".indicator").first()).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();
    await page.goto("http://localhost:8001/components/layout/indicator");
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
