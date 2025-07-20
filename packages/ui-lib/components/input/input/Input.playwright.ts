import { expect, test } from "@playwright/test";

test.describe("Input Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/input");
    await page.waitForLoadState("networkidle");
  });

  test("input basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("input-basic-variants.png");
  });

  test("input sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("input-sizes.png");
  });

  test("input states visual regression", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const statesSection = page.locator(".card").nth(2);
    await expect(statesSection).toHaveScreenshot("input-states.png");
  });

  test("input colors visual regression", async ({ page }) => {
    const colorsSection = page.locator(".card").nth(3);
    await expect(colorsSection).toHaveScreenshot("input-colors.png");
  });

  test("input focus states", async ({ page }) => {
    const textInput = page.locator('input[type="text"]').first();

    // Normal state
    await expect(textInput).toHaveScreenshot("input-normal.png");

    // Focus state
    await textInput.focus();
    await expect(textInput).toHaveScreenshot("input-focus.png");
  });

  test("input hover states", async ({ page }) => {
    const textInput = page.locator('input[type="text"]').first();

    // Hover state
    await textInput.hover();
    await expect(textInput).toHaveScreenshot("input-hover.png");
  });

  // Theme testing
  test("inputs in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`input-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("inputs responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`input-${viewport.name}.png`);
    }
  });

  test("input accessibility features", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    const inputSection = page.locator(".card").first();
    await expect(inputSection).toHaveScreenshot("input-reduced-motion.png");
  });

  test("input with different configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="text" placeholder="Default input" class="input input-bordered" />
        <input type="text" placeholder="Ghost input" class="input input-ghost" />
        <input type="text" placeholder="Primary input" class="input input-bordered input-primary" />
        <input type="text" placeholder="Error input" class="input input-bordered input-error" />
        <input type="text" placeholder="Success input" class="input input-bordered input-success" />
        <input type="text" placeholder="Disabled input" class="input input-bordered" disabled />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("input-different-configs.png");
  });

  test("input with long text", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="text" value="This is a very long text that might overflow the input field" class="input input-bordered" />
        <input type="text" placeholder="Very long placeholder text that demonstrates how the input handles long content" class="input input-bordered" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("input-long-text.png");
  });
});
