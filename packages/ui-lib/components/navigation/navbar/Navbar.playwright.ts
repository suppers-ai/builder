import { expect, test } from "@playwright/test";

test.describe("Navbar Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/navigation/navbar");
    await page.waitForLoadState("networkidle");
  });

  test("navbar basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("navbar-basic-variants.png");
  });

  test("navbar with menu visual regression", async ({ page }) => {
    const menuSection = page.locator(".card").nth(1);
    await expect(menuSection).toHaveScreenshot("navbar-with-menu.png");
  });

  test("navbar responsive visual regression", async ({ page }) => {
    const responsiveSection = page.locator(".card").nth(2);
    await expect(responsiveSection).toHaveScreenshot("navbar-responsive.png");
  });

  // Theme testing
  test("navbars in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const navbarSection = page.locator(".card").first();
      await expect(navbarSection).toHaveScreenshot(`navbar-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("navbars responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const navbarSection = page.locator(".card").first();
      await expect(navbarSection).toHaveScreenshot(`navbar-${viewport.name}.png`);
    }
  });
});
