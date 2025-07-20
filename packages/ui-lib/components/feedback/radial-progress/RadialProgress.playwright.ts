import { expect, test } from "npm:@playwright/test";

test.describe("RadialProgress Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8000/components/feedback/radial-progress");
  });

  test("radial progress display variants", async ({ page }) => {
    const section = page.locator(".examples-section").first();
    await expect(section).toHaveScreenshot("radial-progress-variants.png");
  });

  test("radial progress display values", async ({ page }) => {
    // Test different radial progress values
    const radialProgress = page.locator(".radial-progress");
    if (await radialProgress.count() > 0) {
      await expect(radialProgress.first().locator("..")).toHaveScreenshot(
        "radial-progress-values.png",
      );
    }
  });

  test("radial progress display colors", async ({ page }) => {
    const colorSection = page.locator(".radial-progress").first();
    if (await colorSection.count() > 0) {
      await expect(colorSection.locator("..")).toHaveScreenshot("radial-progress-colors.png");
    }
  });

  test("radial progress display themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);
      const radialProgress = page.locator(".radial-progress").first();
      await expect(radialProgress).toHaveScreenshot(`radial-progress-theme-${theme}.png`);
    }
  });

  test("radial progress display responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      const radialProgress = page.locator(".radial-progress").first();
      await expect(radialProgress).toHaveScreenshot(`radial-progress-${viewport.name}.png`);
    }
  });

  test("radial progress display with text", async ({ page }) => {
    const progressWithText = page.locator(".radial-progress").filter({ hasText: "%" });
    if (await progressWithText.count() > 0) {
      await expect(progressWithText.first()).toHaveScreenshot("radial-progress-with-text.png");
    }
  });

  test("radial progress display sizes", async ({ page }) => {
    const sizeVariants = page.locator(".radial-progress");
    if (await sizeVariants.count() > 2) {
      await expect(sizeVariants.nth(0).locator("..")).toHaveScreenshot("radial-progress-small.png");
      await expect(sizeVariants.nth(1).locator("..")).toHaveScreenshot(
        "radial-progress-medium.png",
      );
      await expect(sizeVariants.nth(2).locator("..")).toHaveScreenshot("radial-progress-large.png");
    }
  });

  test("radial progress display thick stroke", async ({ page }) => {
    const thickProgress = page.locator(".radial-progress[style*='stroke-width']");
    if (await thickProgress.count() > 0) {
      await expect(thickProgress.first()).toHaveScreenshot("radial-progress-thick.png");
    }
  });

  test("radial progress display animation", async ({ page }) => {
    // Test animated radial progress
    const animatedProgress = page.locator(".radial-progress").first();
    await expect(animatedProgress).toBeVisible();

    // Wait for potential animation
    await page.waitForTimeout(1000);
    await expect(animatedProgress).toHaveScreenshot("radial-progress-final.png");
  });
});
