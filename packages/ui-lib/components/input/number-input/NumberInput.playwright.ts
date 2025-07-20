import { expect, test } from "@playwright/test";

test.describe("NumberInput Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/number-input");
    await page.waitForLoadState("networkidle");
  });

  test("number input basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("number-input-basic-variants.png");
  });

  test("number input sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("number-input-sizes.png");
  });

  test("number input states visual regression", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const statesSection = page.locator(".card").nth(2);
    await expect(statesSection).toHaveScreenshot("number-input-states.png");
  });

  test("number input focus states", async ({ page }) => {
    const numberInput = page.locator('input[type="number"]').first();

    // Normal state
    await expect(numberInput).toHaveScreenshot("number-input-normal.png");

    // Focus state
    await numberInput.focus();
    await expect(numberInput).toHaveScreenshot("number-input-focus.png");
  });

  test("number input hover states", async ({ page }) => {
    const numberInput = page.locator('input[type="number"]').first();

    // Hover state
    await numberInput.hover();
    await expect(numberInput).toHaveScreenshot("number-input-hover.png");
  });

  // Theme testing
  test("number inputs in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`number-input-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("number inputs responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`number-input-${viewport.name}.png`);
    }
  });

  test("number input with different configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="number" value="42" class="input input-bordered" />
        <input type="number" min="0" max="100" step="10" class="input input-bordered" />
        <input type="number" value="-15.5" step="0.1" class="input input-bordered" />
        <input type="number" placeholder="Enter number" class="input input-bordered" />
        <input type="number" class="input input-bordered input-error" />
        <input type="number" class="input input-bordered input-success" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("number-input-different-configs.png");
  });

  test("number input with spinner controls", async ({ page }) => {
    // Test the native number input spinner controls
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="number" value="5" min="0" max="10" class="input input-bordered input-lg" />
        <input type="number" value="50" min="0" max="100" step="5" class="input input-bordered" />
        <input type="number" value="0.5" min="0" max="1" step="0.1" class="input input-bordered" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("number-input-spinners.png");
  });
});
