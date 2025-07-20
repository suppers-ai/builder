import { expect, test } from "@playwright/test";

test.describe("FileInput Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/input/file-input");
    await page.waitForLoadState("networkidle");
  });

  test("file input basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("file-input-basic-variants.png");
  });

  test("file input sizes visual regression", async ({ page }) => {
    const sizesSection = page.locator(".card").nth(1);
    await expect(sizesSection).toHaveScreenshot("file-input-sizes.png");
  });

  test("file input states visual regression", async ({ page }) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const statesSection = page.locator(".card").nth(2);
    await expect(statesSection).toHaveScreenshot("file-input-states.png");
  });

  test("file input focus states", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();

    // Normal state
    await expect(fileInput).toHaveScreenshot("file-input-normal.png");

    // Focus state
    await fileInput.focus();
    await expect(fileInput).toHaveScreenshot("file-input-focus.png");
  });

  test("file input hover states", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();

    // Hover state
    await fileInput.hover();
    await expect(fileInput).toHaveScreenshot("file-input-hover.png");
  });

  // Theme testing
  test("file inputs in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`file-input-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("file inputs responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const inputSection = page.locator(".card").first();
      await expect(inputSection).toHaveScreenshot(`file-input-${viewport.name}.png`);
    }
  });

  test("file input accessibility features", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });

    const inputSection = page.locator(".card").first();
    await expect(inputSection).toHaveScreenshot("file-input-reduced-motion.png");
  });

  test("file input with different configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <input type="file" class="file-input file-input-bordered" />
        <input type="file" multiple class="file-input file-input-bordered" />
        <input type="file" accept="image/*" class="file-input file-input-bordered" />
        <input type="file" class="file-input file-input-bordered file-input-error" />
        <input type="file" class="file-input file-input-bordered file-input-success" />
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("file-input-different-configs.png");
  });
});
