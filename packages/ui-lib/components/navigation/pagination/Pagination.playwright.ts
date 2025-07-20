import { expect, test } from "@playwright/test";

test.describe("Pagination Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/navigation/pagination");
    await page.waitForLoadState("networkidle");
  });

  test("pagination basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("pagination-basic-variants.png");
  });

  test("pagination sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("pagination-sizes.png");
  });

  // Theme testing
  test("paginations in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const paginationSection = page.locator(".card").first();
      await expect(paginationSection).toHaveScreenshot(`pagination-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("paginations responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const paginationSection = page.locator(".card").first();
      await expect(paginationSection).toHaveScreenshot(`pagination-${viewport.name}.png`);
    }
  });
});
