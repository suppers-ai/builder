import { expect, test } from "@playwright/test";

test.describe("PhoneMockup Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/mockup/phone-mockup");
    await page.waitForLoadState("networkidle");
  });

  test("phone mockup basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("phone-mockup-basic-variants.png");
  });

  test("phone mockup with content visual regression", async ({ page }) => {
    const contentSection = page.locator(".card").nth(1);
    await expect(contentSection).toHaveScreenshot("phone-mockup-with-content.png");
  });

  // Theme testing
  test("phone mockups in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const mockupSection = page.locator(".card").first();
      await expect(mockupSection).toHaveScreenshot(`phone-mockup-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("phone mockups responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const mockupSection = page.locator(".card").first();
      await expect(mockupSection).toHaveScreenshot(`phone-mockup-${viewport.name}.png`);
    }
  });
});
