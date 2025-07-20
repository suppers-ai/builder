import { expect, test } from "@playwright/test";

test.describe("Indicator Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/indicator");
    await page.waitForLoadState("networkidle");
  });

  test("indicator basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("indicator-basic-variants.png");
  });

  test("indicator positions visual regression", async ({ page }) => {
    const positionsSection = page.locator(".card").nth(1);
    await expect(positionsSection).toHaveScreenshot("indicator-positions.png");
  });

  test("indicator colors visual regression", async ({ page }) => {
    const colorsSection = page.locator(".card").nth(2);
    await expect(colorsSection).toHaveScreenshot("indicator-colors.png");
  });

  // Theme testing
  test("indicators in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const indicatorSection = page.locator(".card").first();
      await expect(indicatorSection).toHaveScreenshot(`indicator-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("indicators responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const indicatorSection = page.locator(".card").first();
      await expect(indicatorSection).toHaveScreenshot(`indicator-${viewport.name}.png`);
    }
  });

  test("indicator configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <div class="indicator">
          <span class="indicator-item badge badge-primary">new</span>
          <div class="grid w-32 h-32 bg-base-300 place-items-center">content</div>
        </div>
        <div class="indicator">
          <span class="indicator-item indicator-start badge badge-secondary">99+</span>
          <div class="grid w-32 h-32 bg-base-300 place-items-center">content</div>
        </div>
        <div class="indicator">
          <span class="indicator-item indicator-center badge badge-accent">center</span>
          <div class="grid w-32 h-32 bg-base-300 place-items-center">content</div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("indicator-configurations.png");
  });
});
