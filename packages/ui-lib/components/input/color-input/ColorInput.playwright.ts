import { expect, test } from "@playwright/test";

test.describe("ColorInput Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to color input component page
    await page.goto("http://localhost:8001/components/input/color-input");
    await page.waitForLoadState("networkidle");
  });

  test("color input basic variants visual regression", async ({ page }) => {
    // Test basic color inputs section
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("color-input-basic-variants.png");
  });

  test("color input sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("color-input-sizes.png");
  });

  test("color input states visual regression", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const statesSection = page.locator(".card").nth(2);
    await expect(statesSection).toHaveScreenshot("color-input-states.png");
  });

  test("color input focus states", async ({ page }) => {
    const colorInput = page.locator('input[type="color"]').first();

    // Normal state
    await expect(colorInput).toHaveScreenshot("color-input-normal.png");

    // Focus state
    await colorInput.focus();
    await expect(colorInput).toHaveScreenshot("color-input-focus.png");
  });

  test("color input hover states", async ({ page }) => {
    const colorInput = page.locator('input[type="color"]').first();

    // Hover state
    await colorInput.hover();
    await expect(colorInput).toHaveScreenshot("color-input-hover.png");
  });

  // Theme testing
  test("color inputs in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      // Change theme
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      // Wait for theme to apply
      await page.waitForTimeout(100);

      // Take screenshot of color input examples
      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`color-input-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("color inputs responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`color-input-${viewport.name}.png`);
    }
  });

  test("color input accessibility features", async ({ page }) => {
    // Test high contrast mode or accessibility features
    await page.emulateMedia({ reducedMotion: "reduce" });

    const inputSection = page.locator(".card").first();
    await expect(inputSection).toHaveScreenshot("color-input-reduced-motion.png");
  });

  test("color input with different values", async ({ page }) => {
    // Test with various color values
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="color" value="#ff0000" class="input input-bordered" />
        <input type="color" value="#00ff00" class="input input-bordered" />
        <input type="color" value="#0000ff" class="input input-bordered" />
        <input type="color" value="#ffffff" class="input input-bordered" />
        <input type="color" value="#000000" class="input input-bordered" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("color-input-different-values.png");
  });
});
