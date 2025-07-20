import { expect, test } from "@playwright/test";

test.describe("CodeMockup Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/mockup/code-mockup");
    await page.waitForLoadState("networkidle");
  });

  test("code mockup basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("code-mockup-basic-variants.png");
  });

  test("code mockup with syntax highlighting visual regression", async ({ page }) => {
    const syntaxSection = page.locator(".card").nth(1);
    await expect(syntaxSection).toHaveScreenshot("code-mockup-syntax-highlighting.png");
  });

  // Theme testing
  test("code mockups in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const mockupSection = page.locator(".card").first();
      await expect(mockupSection).toHaveScreenshot(`code-mockup-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("code mockups responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const mockupSection = page.locator(".card").first();
      await expect(mockupSection).toHaveScreenshot(`code-mockup-${viewport.name}.png`);
    }
  });
});
