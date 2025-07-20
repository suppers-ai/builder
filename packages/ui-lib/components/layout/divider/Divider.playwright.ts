import { expect, test } from "@playwright/test";

test.describe("Divider Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/divider");
    await page.waitForLoadState("networkidle");
  });

  test("divider basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("divider-basic-variants.png");
  });

  test("divider with text visual regression", async ({ page }) => {
    const textSection = page.locator(".card").nth(1);
    await expect(textSection).toHaveScreenshot("divider-with-text.png");
  });

  test("divider vertical visual regression", async ({ page }) => {
    const verticalSection = page.locator(".card").nth(2);
    await expect(verticalSection).toHaveScreenshot("divider-vertical.png");
  });

  test("divider colors visual regression", async ({ page }) => {
    const colorsSection = page.locator(".card").nth(3);
    await expect(colorsSection).toHaveScreenshot("divider-colors.png");
  });

  // Theme testing
  test("dividers in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const dividerSection = page.locator(".card").first();
      await expect(dividerSection).toHaveScreenshot(`divider-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("dividers responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const dividerSection = page.locator(".card").first();
      await expect(dividerSection).toHaveScreenshot(`divider-${viewport.name}.png`);
    }
  });

  test("divider with different configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-8";
      container.innerHTML = `
        <div>
          <p>Content before</p>
          <div class="divider"></div>
          <p>Content after</p>
        </div>
        <div>
          <p>Content before</p>
          <div class="divider">OR</div>
          <p>Content after</p>
        </div>
        <div>
          <p>Content before</p>
          <div class="divider divider-primary">AND</div>
          <p>Content after</p>
        </div>
        <div>
          <p>Content before</p>
          <div class="divider divider-secondary">THEN</div>
          <p>Content after</p>
        </div>
        <div class="flex">
          <div>Left content</div>
          <div class="divider divider-horizontal"></div>
          <div>Right content</div>
        </div>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("divider-different-configs.png");
  });
});
