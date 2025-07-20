import { expect, test } from "npm:@playwright/test";

test.describe("Progress Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/feedback/progress");
  });

  test("progress display variants", async ({ page }) => {
    const section = page.locator(".examples-section").first();
    await expect(section).toHaveScreenshot("progress-variants.png");
  });

  test("progress display values", async ({ page }) => {
    // Test different progress values
    const progressBars = page.locator(".progress");
    if (await progressBars.count() > 0) {
      await expect(progressBars.first().locator("..")).toHaveScreenshot("progress-values.png");
    }
  });

  test("progress display colors", async ({ page }) => {
    const colorSection = page.locator(".progress-primary, .progress-secondary, .progress-accent")
      .first();
    if (await colorSection.count() > 0) {
      await expect(colorSection.locator("..")).toHaveScreenshot("progress-colors.png");
    }
  });

  test("progress display themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);
      const progress = page.locator(".progress").first();
      await expect(progress).toHaveScreenshot(`progress-theme-${theme}.png`);
    }
  });

  test("progress display responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const progress = page.locator(".progress").first();
      await expect(progress).toHaveScreenshot(`progress-${viewport.name}.png`);
    }
  });

  test("progress display with labels", async ({ page }) => {
    const progressWithLabel = page.locator(".progress").filter({ hasText: "%" });
    if (await progressWithLabel.count() > 0) {
      await expect(progressWithLabel.first().locator("..")).toHaveScreenshot(
        "progress-with-labels.png",
      );
    }
  });

  test("progress display animation", async ({ page }) => {
    // Test animated progress bars
    const animatedProgress = page.locator(".progress[data-animated]");
    if (await animatedProgress.count() > 0) {
      await expect(animatedProgress.first()).toHaveScreenshot("progress-animated.png");

      // Wait for animation
      await page.waitForTimeout(500);
      await expect(animatedProgress.first()).toHaveScreenshot("progress-animated-mid.png");
    }
  });

  test("progress display sizes", async ({ page }) => {
    const sizeVariants = page.locator(".progress-xs, .progress-sm, .progress-md, .progress-lg");
    if (await sizeVariants.count() > 0) {
      await expect(sizeVariants.first().locator("..")).toHaveScreenshot("progress-sizes.png");
    }
  });
});
