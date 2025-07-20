import { expect, test } from "@playwright/test";

test.describe("BrowserMockup Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/mockup/browser-mockup");
  });

  test("browser mockup variants", async ({ page }) => {
    const section = page.locator(".examples-section").first();
    await expect(section).toHaveScreenshot("browser-mockup-variants.png");
  });

  test("browser mockup states", async ({ page }) => {
    // Test different states and interactions
    const mockup = page.locator(".mockup-browser").first();
    await expect(mockup).toHaveScreenshot("browser-mockup-default.png");
  });

  test("browser mockup themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100); // Allow theme transition
      const mockup = page.locator(".mockup-browser").first();
      await expect(mockup).toHaveScreenshot(`browser-mockup-theme-${theme}.png`);
    }
  });

  test("browser mockup responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const mockup = page.locator(".mockup-browser").first();
      await expect(mockup).toHaveScreenshot(`browser-mockup-${viewport.name}.png`);
    }
  });

  test("browser mockup accessibility", async ({ page }) => {
    // Test keyboard navigation and focus states
    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);

    const focused = page.locator(":focus");
    if (await focused.count() > 0) {
      await expect(focused).toHaveScreenshot("browser-mockup-focus.png");
    }
  });

  test("browser mockup with custom content", async ({ page }) => {
    // Test with different content types
    const mockup = page.locator(".mockup-browser").first();
    await expect(mockup).toHaveScreenshot("browser-mockup-content.png");
  });
});
