import { expect, test } from "npm:@playwright/test";

test.describe("Loading Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/feedback/loading");
  });

  test("loading display variants", async ({ page }) => {
    const section = page.locator(".examples-section").first();
    await expect(section).toHaveScreenshot("loading-variants.png");
  });

  test("loading display sizes", async ({ page }) => {
    const sizeSection = page.locator(".loading").first().locator("..");
    await expect(sizeSection).toHaveScreenshot("loading-sizes.png");
  });

  test("loading display types", async ({ page }) => {
    // Test different loading types (spinner, dots, ring, ball, bars, infinity)
    const loadingTypes = page.locator(".loading");
    if (await loadingTypes.count() > 0) {
      await expect(loadingTypes.first().locator("..")).toHaveScreenshot("loading-types.png");
    }
  });

  test("loading display themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);
      const loading = page.locator(".loading").first();
      await expect(loading).toHaveScreenshot(`loading-theme-${theme}.png`);
    }
  });

  test("loading display responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const loading = page.locator(".loading").first();
      await expect(loading).toHaveScreenshot(`loading-${viewport.name}.png`);
    }
  });

  test("loading display with text", async ({ page }) => {
    const loadingWithText = page.locator(".loading").filter({ hasText: "Loading" });
    if (await loadingWithText.count() > 0) {
      await expect(loadingWithText.first()).toHaveScreenshot("loading-with-text.png");
    }
  });

  test("loading display animations", async ({ page }) => {
    // Test animation is running
    const loading = page.locator(".loading").first();
    await expect(loading).toBeVisible();

    // Wait for animation cycle
    await page.waitForTimeout(1000);
    await expect(loading).toHaveScreenshot("loading-animation.png");
  });
});
