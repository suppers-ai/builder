import { expect, test } from "@playwright/test";

test.describe("Steps E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/navigation/steps");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays steps examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Steps");
    await expect(page.locator(".steps").first()).toBeVisible();
  });

  test("steps examples render correctly", async ({ page }) => {
    const steps = page.locator(".steps");
    const stepsCount = await steps.count();
    expect(stepsCount).toBeGreaterThanOrEqual(1);
  });

  test("step items work correctly", async ({ page }) => {
    const stepItems = page.locator(".step");
    const hasSteps = await stepItems.count() > 0;

    if (hasSteps) {
      const step = stepItems.first();
      await expect(step).toBeVisible();
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();
    await page.goto("http://localhost:8001/components/navigation/steps");
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
