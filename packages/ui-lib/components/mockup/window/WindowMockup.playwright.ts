import { expect, test } from "npm:@playwright/test";

test.describe("WindowMockup Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8002/components/mockup/window-mockup"); // UI lib tests run against docs package
  });

  test("window mockup variants", async ({ page }) => {
    const section = page.locator(".examples-section").first();
    await expect(section).toHaveScreenshot("window-mockup-variants.png");
  });

  test("window mockup control buttons", async ({ page }) => {
    // Test the window control buttons (red, yellow, green)
    const mockup = page.locator(".mockup-window").first();
    await expect(mockup).toHaveScreenshot("window-mockup-controls.png");
  });

  test("window mockup themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100); // Allow theme transition
      const mockup = page.locator(".mockup-window").first();
      await expect(mockup).toHaveScreenshot(`window-mockup-theme-${theme}.png`);
    }
  });

  test("window mockup responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const mockup = page.locator(".mockup-window").first();
      await expect(mockup).toHaveScreenshot(`window-mockup-${viewport.name}.png`);
    }
  });

  test("window mockup shadow variant", async ({ page }) => {
    // Test shadow variant specifically
    const shadowMockup = page.locator(".mockup-window.shadow-2xl").first();
    if (await shadowMockup.count() > 0) {
      await expect(shadowMockup).toHaveScreenshot("window-mockup-shadow.png");
    }
  });

  test("window mockup bordered variant", async ({ page }) => {
    // Test bordered variant specifically
    const borderedMockup = page.locator(".mockup-window.border").first();
    if (await borderedMockup.count() > 0) {
      await expect(borderedMockup).toHaveScreenshot("window-mockup-bordered.png");
    }
  });

  test("window mockup accessibility", async ({ page }) => {
    // Test keyboard navigation and focus states
    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);

    const focused = page.locator(":focus");
    if (await focused.count() > 0) {
      await expect(focused).toHaveScreenshot("window-mockup-focus.png");
    }
  });
});
