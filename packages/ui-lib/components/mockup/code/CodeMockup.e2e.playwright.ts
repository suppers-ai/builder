import { expect, test } from "@playwright/test";

test.describe("CodeMockup E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/mockup/code-mockup");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and displays code mockup examples", async ({ page }) => {
    await expect(page).toHaveTitle("DaisyUI Component Library - Fresh 2.0");
    await expect(page.locator("h1").first()).toContainText("Code Mockup");
    await expect(page.locator(".mockup-code").first()).toBeVisible();
  });

  test("code mockup examples render correctly", async ({ page }) => {
    const mockups = page.locator(".mockup-code");
    const mockupCount = await mockups.count();
    expect(mockupCount).toBeGreaterThanOrEqual(1);
  });

  test("code content is readable", async ({ page }) => {
    const codeElements = page.locator(".mockup-code pre, .mockup-code code");
    const hasCode = await codeElements.count() > 0;

    if (hasCode) {
      const codeElement = codeElements.first();
      const codeText = await codeElement.textContent();
      expect(codeText?.trim()).toBeTruthy();
    }
  });

  test("API documentation is present", async ({ page }) => {
    await expect(page.locator("table, .api-table")).toBeVisible();
  });

  test("page performance is acceptable", async ({ page }) => {
    const navigationPromise = page.waitForLoadState("networkidle");
    const startTime = Date.now();
    await page.goto("http://localhost:8001/components/mockup/code-mockup");
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
});
