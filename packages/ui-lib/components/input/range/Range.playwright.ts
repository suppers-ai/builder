import { expect, test } from "@playwright/test";

test.describe("Range Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/range");
    await page.waitForLoadState("networkidle");
  });

  test("range variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("range-basic-variants.png");
  });

  test("range colors visual regression", async ({ page }) => {
    const colorsSection = page.locator(".card").nth(1);
    await expect(colorsSection).toHaveScreenshot("range-colors.png");
  });

  test("range sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(2);
    await expect(sizesSection).toHaveScreenshot("range-sizes.png");
  });

  test("range states visual regression", async ({ page }) => {
    const statesSection = page.locator(".card").nth(3);
    await expect(statesSection).toHaveScreenshot("range-states.png");
  });

  test("range interaction states", async ({ page }) => {
    const range = page.locator(".range").first();

    // Normal state
    await expect(range).toHaveScreenshot("range-normal.png");

    // Hover state
    await range.hover();
    await expect(range).toHaveScreenshot("range-hover.png");

    // Focus state
    await range.focus();
    await expect(range).toHaveScreenshot("range-focus.png");
  });

  test("range with different values", async ({ page }) => {
    // Create ranges with different values for visual testing
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="range" class="range range-primary" min="0" max="100" value="0" />
        <input type="range" class="range range-secondary" min="0" max="100" value="25" />
        <input type="range" class="range range-accent" min="0" max="100" value="50" />
        <input type="range" class="range range-success" min="0" max="100" value="75" />
        <input type="range" class="range range-warning" min="0" max="100" value="100" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("range-different-values.png");
  });

  test("ranges in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const rangeSection = page.locator(".card").first();
      await expect(rangeSection).toHaveScreenshot(`ranges-theme-${theme}.png`);
    }
  });

  test("ranges responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const rangeSection = page.locator(".card").first();
      await expect(rangeSection).toHaveScreenshot(`ranges-${viewport.name}.png`);
    }
  });
});
