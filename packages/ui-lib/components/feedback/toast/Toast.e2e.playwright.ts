import { expect, test } from "npm:@playwright/test";

test.describe("Toast E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/feedback/toast");
  });

  test("toast display navigation and visibility", async ({ page }) => {
    await page.click('text="Components"');
    await expect(page).toHaveURL(/components$/);

    await page.goto("http://localhost:8000/components/feedback/toast");
    await expect(page.locator(".toast")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Toast");
  });

  test("toast display positions", async ({ page }) => {
    const positions = [".toast-top", ".toast-bottom", ".toast-start", ".toast-end"];

    for (const position of positions) {
      const toast = page.locator(position);
      if (await toast.count() > 0) {
        await expect(toast.first()).toBeVisible();
      }
    }
  });

  test("toast display dismiss functionality", async ({ page }) => {
    const dismissButton = page.locator(".toast .btn-close, .toast button");
    if (await dismissButton.count() > 0) {
      await dismissButton.first().click();
      await page.waitForTimeout(500);
    }
  });

  test("toast display accessibility", async ({ page }) => {
    const toast = page.locator(".toast").first();
    await expect(toast).toBeVisible();

    const hasAriaAttributes = await toast.evaluate((el) => {
      return el.hasAttribute("role") || el.hasAttribute("aria-live");
    });

    expect(hasAriaAttributes).toBeTruthy();
  });

  test("toast display responsive behavior", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const toast = page.locator(".toast").first();
      if (await toast.count() > 0) {
        await expect(toast).toBeVisible();
      }
    }
  });
});
