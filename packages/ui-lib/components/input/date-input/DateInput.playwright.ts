import { expect, test } from "@playwright/test";

test.describe("DateInput Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to date input component page
    await page.goto("http://localhost:8001/components/input/date-input");
    await page.waitForLoadState("networkidle");
  });

  test("date input basic variants visual regression", async ({ page }) => {
    // Test basic date inputs section
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("date-input-basic-variants.png");
  });

  test("date input sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("date-input-sizes.png");
  });

  test("date input states visual regression", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const statesSection = page.locator(".card").nth(2);
    await expect(statesSection).toHaveScreenshot("date-input-states.png");
  });

  test("date input focus states", async ({ page }) => {
    const dateInput = page.locator('input[type="date"]').first();

    // Normal state
    await expect(dateInput).toHaveScreenshot("date-input-normal.png");

    // Focus state
    await dateInput.focus();
    await expect(dateInput).toHaveScreenshot("date-input-focus.png");
  });

  test("date input hover states", async ({ page }) => {
    const dateInput = page.locator('input[type="date"]').first();

    // Hover state
    await dateInput.hover();
    await expect(dateInput).toHaveScreenshot("date-input-hover.png");
  });

  // Theme testing
  test("date inputs in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      // Change theme
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      // Wait for theme to apply
      await page.waitForTimeout(100);

      // Take screenshot of date input examples
      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`date-input-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("date inputs responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`date-input-${viewport.name}.png`);
    }
  });

  test("date input accessibility features", async ({ page }) => {
    // Test high contrast mode or accessibility features
    await page.emulateMedia({ reducedMotion: "reduce" });

    const inputSection = page.locator(".card").first();
    await expect(inputSection).toHaveScreenshot("date-input-reduced-motion.png");
  });

  test("date input with different values", async ({ page }) => {
    // Test with various date values
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="date" value="2024-01-01" class="input input-bordered" />
        <input type="date" value="2024-12-31" class="input input-bordered" />
        <input type="date" min="2024-01-01" max="2024-12-31" class="input input-bordered" />
        <input type="date" class="input input-bordered input-error" />
        <input type="date" class="input input-bordered input-success" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("date-input-different-values.png");
  });
});
