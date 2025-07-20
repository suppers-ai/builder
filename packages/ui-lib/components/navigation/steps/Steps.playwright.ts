import { expect, test } from "@playwright/test";

test.describe("Steps Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/navigation/steps");
    await page.waitForLoadState("networkidle");
  });

  test("steps basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("steps-basic-variants.png");
  });

  test("steps with colors visual regression", async ({ page }) => {
    const colorsSection = page.locator(".card").nth(1);
    await expect(colorsSection).toHaveScreenshot("steps-with-colors.png");
  });

  test("steps vertical visual regression", async ({ page }) => {
    const verticalSection = page.locator(".card").nth(2);
    await expect(verticalSection).toHaveScreenshot("steps-vertical.png");
  });

  // Theme testing
  test("steps in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const stepsSection = page.locator(".card").first();
      await expect(stepsSection).toHaveScreenshot(`steps-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("steps responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const stepsSection = page.locator(".card").first();
      await expect(stepsSection).toHaveScreenshot(`steps-${viewport.name}.png`);
    }
  });
});
