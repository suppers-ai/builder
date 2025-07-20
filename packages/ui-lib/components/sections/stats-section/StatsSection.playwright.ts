import { expect, test } from "@playwright/test";

test.describe("StatsSection Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/sections/stats-section");
    await page.waitForLoadState("networkidle");
  });

  test("stats section basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("stats-section-basic-variants.png");
  });

  test("stats section with icons visual regression", async ({ page }) => {
    const iconsSection = page.locator(".card").nth(1);
    await expect(iconsSection).toHaveScreenshot("stats-section-with-icons.png");
  });

  // Theme testing
  test("stats sections in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const statsSection = page.locator(".card").first();
      await expect(statsSection).toHaveScreenshot(`stats-section-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("stats sections responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const statsSection = page.locator(".card").first();
      await expect(statsSection).toHaveScreenshot(`stats-section-${viewport.name}.png`);
    }
  });
});
