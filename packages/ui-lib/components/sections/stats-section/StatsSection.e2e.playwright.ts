import { expect, test } from "@playwright/test";

test.describe("StatsSection E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/sections/stats-section");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays stats section examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Stats Section");
    await expect(page.locator(".stats").first()).toBeVisible();
  });

  test("stats section examples render correctly", async ({ page }) => {
    const statsElements = page.locator(".stats");
    const statsCount = await statsElements.count();
    expect(statsCount).toBeGreaterThanOrEqual(1);
  });

  test("stat values are readable", async ({ page }) => {
    const statValues = page.locator(".stat-value");
    const hasValues = await statValues.count() > 0;

    if (hasValues) {
      const statValue = statValues.first();
      const valueText = await statValue.textContent();
      expect(valueText?.trim()).toBeTruthy();
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();
    await page.goto("http://localhost:8001/components/sections/stats-section");
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
