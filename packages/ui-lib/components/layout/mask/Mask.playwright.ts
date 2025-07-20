import { expect, test } from "@playwright/test";

test.describe("Mask Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/mask");
    await page.waitForLoadState("networkidle");
  });

  test("mask basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("mask-basic-variants.png");
  });

  test("mask shapes visual regression", async ({ page }) => {
    const shapesSection = page.locator(".card").nth(1);
    await expect(shapesSection).toHaveScreenshot("mask-shapes.png");
  });

  test("mask with images visual regression", async ({ page }) => {
    const imagesSection = page.locator(".card").nth(2);
    await expect(imagesSection).toHaveScreenshot("mask-with-images.png");
  });

  // Theme testing
  test("masks in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const maskSection = page.locator(".card").first();
      await expect(maskSection).toHaveScreenshot(`mask-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("masks responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const maskSection = page.locator(".card").first();
      await expect(maskSection).toHaveScreenshot(`mask-${viewport.name}.png`);
    }
  });

  test("mask configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-x-4 flex flex-wrap";
      container.innerHTML = `
        <div class="mask mask-squircle w-20 h-20 bg-primary"></div>
        <div class="mask mask-heart w-20 h-20 bg-secondary"></div>
        <div class="mask mask-hexagon w-20 h-20 bg-accent"></div>
        <div class="mask mask-hexagon-2 w-20 h-20 bg-neutral"></div>
        <div class="mask mask-decagon w-20 h-20 bg-primary"></div>
        <div class="mask mask-pentagon w-20 h-20 bg-secondary"></div>
        <div class="mask mask-diamond w-20 h-20 bg-accent"></div>
        <div class="mask mask-square w-20 h-20 bg-neutral"></div>
        <div class="mask mask-circle w-20 h-20 bg-primary"></div>
        <div class="mask mask-parallelogram w-20 h-20 bg-secondary"></div>
        <div class="mask mask-parallelogram-2 w-20 h-20 bg-accent"></div>
        <div class="mask mask-parallelogram-3 w-20 h-20 bg-neutral"></div>
        <div class="mask mask-parallelogram-4 w-20 h-20 bg-primary"></div>
        <div class="mask mask-star w-20 h-20 bg-secondary"></div>
        <div class="mask mask-star-2 w-20 h-20 bg-accent"></div>
        <div class="mask mask-triangle w-20 h-20 bg-neutral"></div>
        <div class="mask mask-triangle-2 w-20 h-20 bg-primary"></div>
        <div class="mask mask-triangle-3 w-20 h-20 bg-secondary"></div>
        <div class="mask mask-triangle-4 w-20 h-20 bg-accent"></div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("mask-all-shapes.png");
  });
});
