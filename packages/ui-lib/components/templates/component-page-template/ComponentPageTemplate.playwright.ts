import { expect, test } from "@playwright/test";

test.describe("ComponentPageTemplate Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/action/button"); // Use existing component page
    await page.waitForLoadState("networkidle");
  });

  test("component page template layout visual regression", async ({ page }) => {
    // Test the overall layout of component pages
    const mainContent = page.locator("main");
    await expect(mainContent).toHaveScreenshot("component-page-template-layout.png");
  });

  test("component page header visual regression", async ({ page }) => {
    const header = page.locator("h1").first().locator("..");
    await expect(header).toHaveScreenshot("component-page-template-header.png");
  });

  test("component page breadcrumbs visual regression", async ({ page }) => {
    const breadcrumbs = page.locator(".breadcrumbs");
    await expect(breadcrumbs).toHaveScreenshot("component-page-template-breadcrumbs.png");
  });

  test("component examples section visual regression", async ({ page }) => {
    const examplesSection = page.locator(".card").first();
    await expect(examplesSection).toHaveScreenshot("component-page-template-examples.png");
  });

  // Theme testing
  test("component page template in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const mainContent = page.locator("main");
      await expect(mainContent).toHaveScreenshot(`component-page-template-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("component page template responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const mainContent = page.locator("main");
      await expect(mainContent).toHaveScreenshot(`component-page-template-${viewport.name}.png`);
    }
  });
});
