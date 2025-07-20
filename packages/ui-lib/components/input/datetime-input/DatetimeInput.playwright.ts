import { expect, test } from "@playwright/test";

test.describe("DatetimeInput Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to datetime input component page
    await page.goto("http://localhost:8001/components/input/datetime-input");
    await page.waitForLoadState("networkidle");
  });

  test("datetime input basic variants visual regression", async ({ page }) => {
    // Test basic datetime inputs section
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("datetime-input-basic-variants.png");
  });

  test("datetime input sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("datetime-input-sizes.png");
  });

  test("datetime input states visual regression", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const statesSection = page.locator(".card").nth(2);
    await expect(statesSection).toHaveScreenshot("datetime-input-states.png");
  });

  test("datetime input focus states", async ({ page }) => {
    const datetimeInput = page.locator('input[type="datetime-local"]').first();

    // Normal state
    await expect(datetimeInput).toHaveScreenshot("datetime-input-normal.png");

    // Focus state
    await datetimeInput.focus();
    await expect(datetimeInput).toHaveScreenshot("datetime-input-focus.png");
  });

  // Theme testing
  test("datetime inputs in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`datetime-input-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("datetime inputs responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`datetime-input-${viewport.name}.png`);
    }
  });

  test("datetime input with different values", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="datetime-local" value="2024-01-01T12:00" class="input input-bordered" />
        <input type="datetime-local" value="2024-12-31T23:59" class="input input-bordered" />
        <input type="datetime-local" min="2024-01-01T00:00" max="2024-12-31T23:59" class="input input-bordered" />
        <input type="datetime-local" class="input input-bordered input-error" />
        <input type="datetime-local" class="input input-bordered input-success" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("datetime-input-different-values.png");
  });
});
