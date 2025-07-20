import { expect, test } from "npm:@playwright/test";

test.describe("ThemeController Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/action/theme-controller");
  });

  test("theme controller variants", async ({ page }) => {
    const section = page.locator(".examples-section").first();
    await expect(section).toHaveScreenshot("theme-controller-variants.png");
  });

  test("theme controller dropdown variant", async ({ page }) => {
    const dropdown = page.locator(".dropdown").first();
    await expect(dropdown).toHaveScreenshot("theme-controller-dropdown-closed.png");

    // Click to open dropdown
    await dropdown.locator("button").click();
    await page.waitForTimeout(200); // Allow for dropdown animation
    await expect(dropdown).toHaveScreenshot("theme-controller-dropdown-open.png");
  });

  test("theme controller toggle variant", async ({ page }) => {
    const toggleController = page.locator(".toggle").first();
    if (await toggleController.count() > 0) {
      await expect(toggleController).toHaveScreenshot("theme-controller-toggle.png");

      // Click to toggle
      await toggleController.click();
      await page.waitForTimeout(100);
      await expect(toggleController).toHaveScreenshot("theme-controller-toggle-checked.png");
    }
  });

  test("theme controller radio variant", async ({ page }) => {
    const radioController = page.locator(".radio").first();
    if (await radioController.count() > 0) {
      await expect(radioController.parent()).toHaveScreenshot("theme-controller-radio.png");
    }
  });

  test("theme controller sizes", async ({ page }) => {
    const sizes = ["xs", "sm", "md", "lg", "xl"];

    for (const size of sizes) {
      const sizedController = page.locator(`[class*="btn-${size}"]`).first();
      if (await sizedController.count() > 0) {
        await expect(sizedController).toHaveScreenshot(`theme-controller-size-${size}.png`);
      }
    }
  });

  test("theme controller themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100); // Allow theme transition
      const controller = page.locator(".dropdown, .toggle, .radio").first();
      await expect(controller).toHaveScreenshot(`theme-controller-theme-${theme}.png`);
    }
  });

  test("theme controller responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const controller = page.locator(".dropdown, .toggle, .radio").first();
      await expect(controller).toHaveScreenshot(`theme-controller-${viewport.name}.png`);
    }
  });

  test("theme controller focus states", async ({ page }) => {
    // Test keyboard navigation and focus
    await page.keyboard.press("Tab");
    await page.waitForTimeout(100);

    const focused = page.locator(":focus");
    if (await focused.count() > 0) {
      await expect(focused).toHaveScreenshot("theme-controller-focus.png");
    }
  });

  test("theme controller dropdown with preview", async ({ page }) => {
    // If there's a preview mode, test it
    const dropdown = page.locator(".dropdown").first();
    await dropdown.locator("button").click();

    // Look for color preview dots
    const colorPreviews = page.locator("[style*='backgroundColor']");
    if (await colorPreviews.count() > 0) {
      await expect(dropdown).toHaveScreenshot("theme-controller-dropdown-with-preview.png");
    }
  });

  test("theme controller hover states", async ({ page }) => {
    const controller = page.locator(".btn, .toggle, .radio").first();

    // Normal state
    await expect(controller).toHaveScreenshot("theme-controller-normal.png");

    // Hover state
    await controller.hover();
    await page.waitForTimeout(100);
    await expect(controller).toHaveScreenshot("theme-controller-hover.png");
  });
});
