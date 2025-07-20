import { expect, test } from "@playwright/test";

test.describe("Navbar E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/navigation/navbar");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays navbar examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Navbar");
    await expect(page.locator(".navbar").first()).toBeVisible();
  });

  test("navbar examples render correctly", async ({ page }) => {
    const navbars = page.locator(".navbar");
    const navbarCount = await navbars.count();
    expect(navbarCount).toBeGreaterThanOrEqual(1);
  });

  test("navbar links work", async ({ page }) => {
    const navbarLinks = page.locator(".navbar a");
    const hasLinks = await navbarLinks.count() > 0;

    if (hasLinks) {
      const link = navbarLinks.first();
      await link.hover();
      await expect(link).toBeVisible();
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();
    await page.goto("http://localhost:8001/components/navigation/navbar");
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
