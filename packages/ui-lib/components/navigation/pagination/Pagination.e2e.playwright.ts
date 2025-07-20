import { expect, test } from "@playwright/test";

test.describe("Pagination E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/navigation/pagination");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays pagination examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Pagination");
    await expect(page.locator(".pagination, .join").first()).toBeVisible();
  });

  test("pagination examples render correctly", async ({ page }) => {
    const paginations = page.locator(".pagination, .join");
    const paginationCount = await paginations.count();
    expect(paginationCount).toBeGreaterThanOrEqual(1);
  });

  test("pagination buttons work", async ({ page }) => {
    const paginationButtons = page.locator(".pagination button, .join button");
    const hasButtons = await paginationButtons.count() > 0;

    if (hasButtons) {
      const button = paginationButtons.first();
      await button.click();
      await expect(button).toBeVisible();
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();
    await page.goto("http://localhost:8001/components/navigation/pagination");
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
