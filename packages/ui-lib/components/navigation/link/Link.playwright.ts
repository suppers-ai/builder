import { expect, test } from "@playwright/test";

test.describe("Link Visual Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8001/components/layout/link");
    await page.waitForLoadState("networkidle");
  });

  test("link basic variants visual regression", async ({ page }) => {
    const basicSection = page.locator(".card").first();
    await expect(basicSection).toHaveScreenshot("link-basic-variants.png");
  });

  test("link colors visual regression", async ({ page }) => {
    const colorsSection = page.locator(".card").nth(1);
    await expect(colorsSection).toHaveScreenshot("link-colors.png");
  });

  test("link hover states", async ({ page }) => {
    const link = page.locator(".link").first();

    // Normal state
    await expect(link).toHaveScreenshot("link-normal.png");

    // Hover state
    await link.hover();
    await expect(link).toHaveScreenshot("link-hover.png");
  });

  // Theme testing
  test("links in different themes", async ({ page }) => {
    const themes = ["light", "dark", "cupcake", "cyberpunk", "synthwave"];

    for (const theme of themes) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute("data-theme", theme);
      }, theme);

      await page.waitForTimeout(100);

      const linkSection = page.locator(".card").first();
      await expect(linkSection).toHaveScreenshot(`link-theme-${theme}.png`);
    }
  });

  // Responsive testing
  test("links responsive design", async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: "mobile" },
      { width: 768, height: 1024, name: "tablet" },
      { width: 1920, height: 1080, name: "desktop" },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);

      const linkSection = page.locator(".card").first();
      await expect(linkSection).toHaveScreenshot(`link-${viewport.name}.png`);
    }
  });

  test("link configurations", async ({ page }) => {
    await page.evaluate(() => {
      const container = document.createElement("div");
      container.className = "p-4 space-y-4";
      container.innerHTML = `
        <a class="link">Default link</a>
        <a class="link link-primary">Primary link</a>
        <a class="link link-secondary">Secondary link</a>
        <a class="link link-accent">Accent link</a>
        <a class="link link-neutral">Neutral link</a>
        <a class="link link-hover">Hover link</a>
      `;
      document.body.appendChild(container);
    });

    const container = page.locator("div").last();
    await expect(container).toHaveScreenshot("link-configurations.png");
  });
});
