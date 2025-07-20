import { expect, test } from "@playwright/test";

test.describe("PhoneMockup E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/mockup/phone-mockup");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays phone mockup examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Phone Mockup");
    await expect(page.locator(".mockup-phone").first()).toBeVisible();
  });

  test("phone mockup examples render correctly", async ({ page }) => {
    const mockups = page.locator(".mockup-phone");
    const mockupCount = await mockups.count();
    expect(mockupCount).toBeGreaterThanOrEqual(1);
  });

  test("phone mockup content is interactive", async ({ page }) => {
    const mockupButtons = page.locator(".mockup-phone button");
    const hasButtons = await mockupButtons.count() > 0;

    if (hasButtons) {
      const button = mockupButtons.first();
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
    await page.goto("http://localhost:8001/components/mockup/phone-mockup");
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
